# CAPTEN API Specification

This document details the API operations for CAPTEN, a SaaS for Run Club organizers. Since CAPTEN is built on Supabase, the API is primarily composed of Supabase Client SDK calls and Edge Functions.

## 1. Authentication API

### Organizer Sign Up
- **Method:** `supabase.auth.signUp()`
- **Parameters:**
  ```typescript
  { 
    email: string, 
    password: string, 
    options: { data: { full_name: string, role: 'organizer' } } 
  }
  ```
- **Return Type:** `Promise<{ data: { user: User | null, session: Session | null }, error: AuthError | null }>`
- **RLS Policy:** Built-in Auth
- **Error Handling:** Catch `AuthError`, handle `user_already_exists` or `weak_password`.

### Organizer Sign In
- **Method:** `supabase.auth.signInWithPassword()`
- **Parameters:** `{ email: string, password: string }`
- **Return Type:** `Promise<{ data: { user: User | null, session: Session | null }, error: AuthError | null }>`

### Member Magic Link / OTP
- **Method:** `supabase.auth.signInWithOtp()`
- **Parameters:** `{ phone: string }` (or email for magic link)
- **Return Type:** `Promise<{ data: { user: User | null, session: Session | null }, error: AuthError | null }>`

### Sign Out
- **Method:** `supabase.auth.signOut()`

### Get Current User
- **Method:** `supabase.auth.getUser()`

## 2. Club API

### Create Club
- **Method:** `supabase.from('clubs').insert(data).select().single()`
- **Parameters:** `{ name: string, slug: string, description?: string, logo_url?: string }`
- **Return Type:** `Promise<{ data: Club | null, error: PostgrestError | null }>`
- **RLS Policy:** `insert` allowed if authenticated user has `role = 'organizer'`.

### Get Club by Slug (public)
- **Method:** `supabase.from('clubs').select('*').eq('slug', slug).single()`
- **RLS Policy:** `select` is public.

### Update Club
- **Method:** `supabase.from('clubs').update(data).eq('id', clubId)`
- **RLS Policy:** `update` allowed if user is the club owner.

### Delete Club
- **Method:** `supabase.from('clubs').delete().eq('id', clubId)`
- **RLS Policy:** `delete` allowed if user is the club owner.

### Get Club Stats (view)
- **Method:** `supabase.from('club_stats_view').select('*').eq('club_id', clubId).single()`
- **RLS Policy:** `select` allowed for club owners.

### Get Club Members
- **Method:** `supabase.from('club_members').select('*, profiles(*)').eq('club_id', clubId)`
- **RLS Policy:** `select` allowed for club owners and members.

## 3. Events API

### Create Event
- **Method:** `supabase.from('events').insert(data).select().single()`
- **Parameters:** `{ club_id: string, name: string, start_time: string, meeting_point: { lat: number, lng: number, address: string }, checkin_radius_meters: number }`
- **RLS Policy:** `insert` allowed for club owners.

### List Events (by club)
- **Method:** `supabase.from('events').select('*').eq('club_id', clubId).order('start_time', { ascending: true })`

### Get Event by ID
- **Method:** `supabase.from('events').select('*').eq('id', eventId).single()`

### Update Event
- **Method:** `supabase.from('events').update(data).eq('id', eventId)`

### Cancel Event
- **Method:** `supabase.from('events').update({ status: 'cancelled' }).eq('id', eventId)`

### Complete Event
- **Method:** `supabase.from('events').update({ status: 'completed' }).eq('id', eventId)`

### Get Event with Registrations and Check-ins
- **Method:** `supabase.from('events').select('*, registrations(*, profiles(*)), checkins(*, profiles(*))').eq('id', eventId).single()`

## 4. Registration API

### Register for Event
- **Method:** `supabase.from('registrations').insert({ event_id, user_id })`
- **RLS Policy:** `insert` allowed for authenticated members.

### Cancel Registration
- **Method:** `supabase.from('registrations').delete().match({ event_id, user_id })`

### Get Event Registrations
- **Method:** `supabase.from('registrations').select('*, profiles(*)').eq('event_id', eventId)`

### Check if Member is Registered
- **Method:** `supabase.from('registrations').select('id').match({ event_id, user_id }).single()`

## 5. Check-in API

### Perform GPS Check-in
**Flow:**
1. Get member's current GPS position (Client).
2. Call Supabase to get event meeting point coordinates.
3. Calculate distance using Haversine formula (Edge Function or DB trigger is safer, but can be done client-side + Edge validation).
4. If distance <= `checkin_radius_meters`: valid check-in.
5. `supabase.functions.invoke('perform-checkin', { body: { event_id, lat, lng } })`
6. Edge function inserts into `checkins` table and triggers badge calculation.
7. Return result with any new badges unlocked.

### Perform QR Check-in
- **Method:** Organizer scans QR -> `supabase.functions.invoke('qr-checkin', { body: { token, event_id } })`

### Get Live Check-ins for Event
- **Method:** `supabase.from('checkins').select('*, profiles(*)').eq('event_id', eventId)`
- **Realtime:** Set up realtime subscription (see Realtime section).

### Export Attendance Registry (PDF/CSV)
- **Method:** `supabase.functions.invoke('export-attendance-registry', { body: { event_id, format: 'pdf' } })`

## 6. ICE API

### Create/Update ICE Contact
- **Method:** `supabase.from('ice_contacts').upsert(data)`

### Get ICE Contact (by member)
- **Method:** `supabase.from('ice_contacts').select('*').eq('user_id', userId)`

### Get All ICE Contacts (for organizer, by event)
- **Method:** `supabase.from('event_ice_contacts_view').select('*').eq('event_id', eventId)`

## 7. Waiver API

### Sign Waiver
- **Method:** `supabase.from('waivers').insert({ user_id, club_id, accepted_at: now() })`

### Get Waiver Status
- **Method:** `supabase.from('waivers').select('*').match({ user_id, club_id }).single()`

### Get All Waivers (for organizer, by club)
- **Method:** `supabase.from('waivers').select('*, profiles(*)').eq('club_id', clubId)`

## 8. Member API

### Get Member Profile
- **Method:** `supabase.from('profiles').select('*').eq('id', userId).single()`

### Update Member Profile
- **Method:** `supabase.from('profiles').update(data).eq('id', userId)`

### Get Member by Token (for micro-page)
- **Method:** `supabase.from('profiles').select('*').eq('token', token).single()` (Public read with valid token)

### Get Member Badges
- **Method:** `supabase.from('member_badges').select('*, badges(*)').eq('user_id', userId)`

### Get Member Participation History
- **Method:** `supabase.from('checkins').select('*, events(*)').eq('user_id', userId).order('created_at', { ascending: false })`

### Get Member Stats
- **Method:** `supabase.from('member_stats_view').select('*').eq('user_id', userId).single()`

## 9. Badge API

### Get All Badges (definitions)
- **Method:** `supabase.from('badges').select('*')`

### Get Member Badges
- **Method:** `supabase.from('member_badges').select('*, badges(*)').eq('user_id', userId)`

### Check and Award Badges (Edge Function)
**Logic:**
```typescript
// After check-in, calculate:
const { data: checkins } = await supabase.from('checkins').select('id, event_id(meeting_point)').eq('user_id', userId);
const totalCheckins = checkins.length;
const uniqueLocations = new Set(checkins.map(c => c.event_id.meeting_point)).size;
// ... (referrals, club age, etc.)

// Check thresholds:
if (totalCheckins >= 1) await awardBadge(userId, 'first_run');
if (totalCheckins >= 10) await awardBadge(userId, 'regular');
if (totalCheckins >= 100) await awardBadge(userId, 'legend');
if (uniqueLocations >= 5) await awardBadge(userId, 'explorer');
```

## 10. CAPTEN Spots API

### Create Spot
- **Method:** `supabase.from('capten_spots').insert(data)`

### List Spots (by club)
- **Method:** `supabase.from('capten_spots').select('*').eq('club_id', clubId)`

### Record Transaction
- **Method:** `supabase.from('spot_transactions').insert({ spot_id, user_id, amount, type })`

### Get Spot Stats
- **Method:** `supabase.from('spot_stats_view').select('*').eq('spot_id', spotId)`

### Get Club Cagnotte Balance
- **Method:** `supabase.rpc('get_club_cagnotte_balance', { p_club_id: clubId })`

## 11. Realtime Subscriptions

### Live Check-in Updates
```typescript
supabase
  .channel('event-checkins')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'checkins',
    filter: `event_id=eq.${eventId}`
  }, (payload) => {
    // Add new check-in to list
  })
  .subscribe()
```

### Live Registration Updates
```typescript
supabase
  .channel('event-registrations')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'registrations',
    filter: `event_id=eq.${eventId}`
  }, (payload) => {
    // Update UI
  })
  .subscribe()
```

## 12. Edge Functions

### process-checkin
- **Path:** `/process-checkin`
- **Method:** `POST`
- **Body:** `{ event_id: string, lat: number, lng: number }`
- **Response:** `{ success: boolean, badges_awarded: string[], message: string }`
- **Logic:** Validate GPS -> Insert checkin -> Call award-badges logic -> Return status.

### export-attendance-registry
- **Path:** `/export-attendance-registry`
- **Method:** `POST`
- **Body:** `{ event_id: string, format: 'csv' | 'pdf' }`
- **Response:** `{ url: string }`
- **Logic:** Fetch checkins + profiles -> Generate CSV/PDF -> Upload to Supabase Storage -> Return signed URL.

### generate-waiver-pdf
- **Path:** `/generate-waiver-pdf`
- **Method:** `POST`
- **Body:** `{ waiver_id: string }`
- **Response:** `{ url: string }`
- **Logic:** Fetch waiver data -> Generate PDF -> Store -> Return URL.
