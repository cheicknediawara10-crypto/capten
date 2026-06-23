import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, content } = body;

    if (!phone || !content) {
      return NextResponse.json({ error: 'Missing phone or content parameters' }, { status: 400 });
    }

    // 1. Normalize phone number format (remove non-digits, strip plus/leading zeros, handle standard French format)
    let cleanPhone = phone.trim();
    // Remove leading '+' or '00'
    cleanPhone = cleanPhone.replace(/^\+|00/, '');
    // Remove any spaces, dashes, or parentheses
    cleanPhone = cleanPhone.replace(/[\s\-\(\)]/g, '');

    // If it's a standard French local number (e.g. 0612345678), convert to international (33612345678)
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = '33' + cleanPhone.slice(1);
    }

    const token = process.env.WHAPI_TOKEN || '';

    // 2. Fallback to simulation if token is not configured
    if (!token || token === '' || token.includes('votre_token_whapi_ici')) {
      return NextResponse.json({
        success: true,
        demoMode: true,
        message: "[MODE DÉMO] Message simulé avec succès.",
        payload: {
          to: cleanPhone,
          body: content,
        },
        notice: "Pour envoyer un vrai message, configurez votre variable WHAPI_TOKEN sur Vercel ou dans votre fichier .env.local"
      });
    }

    // 3. Make real HTTP request to Whapi.cloud API
    const res = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: cleanPhone,
        body: content,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        demoMode: false,
        message: "Message envoyé avec succès via Whapi.cloud API !",
        response: data,
      });
    } else {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Erreur API Whapi (${res.status}): ${errText}` },
        { status: res.status }
      );
    }
  } catch (error: any) {
    console.error('Send Test WhatsApp Message Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
