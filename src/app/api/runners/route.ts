import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/runners — Fetch all runners associated with the captain's club
export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase non configuré. Mode local actif.' }, { status: 200 });
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: runners, error } = await supabaseAdmin
      .from('runners')
      .select('*')
      .eq('club_id', captainId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(runners);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/runners — Create/add a runner under the captain's club
export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase non configuré. Ajout simulé localement.' }, { status: 200 });
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { 
      name, phone, email, role, reliability, pace, 
      emergency_name, emergency_phone, emergency_relation,
      birth_date, blood_type, allergies, health_issues, insurance, address
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Champs obligatoires : name, phone' }, { status: 400 });
    }

    const { data: newRunner, error } = await supabaseAdmin
      .from('runners')
      .insert([{
        name,
        phone,
        email: email || null,
        role: role || 'Membre',
        reliability: reliability !== undefined ? parseInt(String(reliability)) : 90,
        pace: pace || '5:00/K',
        club_id: captainId,
        emergency_name: emergency_name || null,
        emergency_phone: emergency_phone || null,
        emergency_relation: emergency_relation || null,
        birth_date: birth_date || null,
        blood_type: blood_type || null,
        allergies: allergies || null,
        health_issues: health_issues || null,
        insurance: insurance || null,
        address: address || null,
        join_date: new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', month: 'short', year: 'numeric' })
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(newRunner, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/runners — Update a runner under the captain's club
export async function PATCH(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase non configuré.' }, { status: 200 });
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    // Whitelist des champs autorisés pour éviter l'injection (ex: changement de club_id)
    const ALLOWED_FIELDS = [
      'name', 'phone', 'email', 'role', 'reliability', 'pace',
      'emergency_name', 'emergency_phone', 'emergency_relation',
      'birth_date', 'blood_type', 'allergies', 'health_issues',
      'insurance', 'address', 'signed_waiver', 'is_blacklisted'
    ];

    const sanitizedUpdate: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        sanitizedUpdate[key] = body[key];
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      return NextResponse.json({ error: 'Aucun champ valide à mettre à jour' }, { status: 400 });
    }

    const { data: updatedRunner, error } = await supabaseAdmin
      .from('runners')
      .update(sanitizedUpdate)
      .eq('id', id)
      .eq('club_id', captainId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(updatedRunner);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/runners — Delete/remove a runner from the captain's club
export async function DELETE(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase non configuré.' }, { status: 200 });
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('runners')
      .delete()
      .eq('id', id)
      .eq('club_id', captainId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Coureur supprimé avec succès.' });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
