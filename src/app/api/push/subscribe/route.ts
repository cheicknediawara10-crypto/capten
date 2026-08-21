import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembreSession } from "@/lib/membre-session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const { endpoint, keys, clubId } = body;
    const membreId = await getMembreSession();

    let supabase: ReturnType<typeof createAdminClient>;
    try {
      supabase = createAdminClient();
    } catch {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    const { error } = await (supabase as any)
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          club_id: clubId || null,
          membre_id: membreId || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      console.error("[push-subscribe error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "server_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.endpoint) {
      return NextResponse.json({ error: "missing_endpoint" }, { status: 400 });
    }

    let supabase: ReturnType<typeof createAdminClient>;
    try {
      supabase = createAdminClient();
    } catch {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    await (supabase as any)
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", body.endpoint);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "server_error" }, { status: 500 });
  }
}
