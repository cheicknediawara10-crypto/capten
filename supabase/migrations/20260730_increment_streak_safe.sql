-- ═══════════════════════════════════════════════════════════
-- CAPTEN — Atomic streak increment (prevents race condition)
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_streak_safe(
  p_runner_id uuid,
  p_run_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_counted boolean;
BEGIN
  -- Check if a checked_in registration already existed BEFORE this request
  -- The upsert in the API route creates/updates the row, so if count > 1 
  -- it means there was already one (impossible with unique constraint).
  -- Instead, we use an advisory lock to serialize streak updates per runner.
  
  -- Acquire an advisory lock on the runner_id to prevent concurrent increments
  PERFORM pg_advisory_xact_lock(hashtext(p_runner_id::text || p_run_id::text));
  
  -- Check if streak was already counted for this specific run
  -- We use a helper table or check the registration timestamp
  SELECT EXISTS(
    SELECT 1 FROM registrations 
    WHERE runner_id = p_runner_id 
      AND run_id = p_run_id 
      AND status = 'checked_in'
      AND checked_in_at < (NOW() - INTERVAL '2 seconds')
  ) INTO v_already_counted;
  
  -- Only increment if this is the first check-in for this run
  IF NOT v_already_counted THEN
    UPDATE runners 
    SET streak_count = COALESCE(streak_count, 0) + 1
    WHERE id = p_runner_id;
  END IF;
END;
$$;

-- Grant execute to the service role
GRANT EXECUTE ON FUNCTION increment_streak_safe(uuid, uuid) TO service_role;
