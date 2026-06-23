import { NextResponse } from 'next/server';
import { queueBroadcast } from '@/lib/broadcast';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { run } = body;

    if (!run || !run.id || !run.title) {
      return NextResponse.json(
        { error: "Paramètres 'run' ou 'run.id' manquants." },
        { status: 400 }
      );
    }

    const data = await queueBroadcast(run);

    return NextResponse.json({
      success: true,
      message: "Diffusion WhatsApp planifiée avec succès (buffer de 10 minutes).",
      data
    });
  } catch (error: any) {
    console.error("Error scheduling broadcast:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur lors de la planification." },
      { status: 500 }
    );
  }
}
