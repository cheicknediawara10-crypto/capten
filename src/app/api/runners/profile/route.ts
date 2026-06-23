import { NextResponse } from 'next/server';
import { RunnerRepository } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID du runner manquant." }, { status: 400 });
    }

    const runner = await RunnerRepository.getById(id);

    if (!runner) {
      return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      runner
    });

  } catch (error: any) {
    console.error("Error in GET /api/runners/profile:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
