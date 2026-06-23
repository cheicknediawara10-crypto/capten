import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = process.env.WHAPI_TOKEN || '';

    // Fallback if token is demo/placeholder
    if (!token || token === '' || token.includes('votre_token_whapi_ici')) {
      return NextResponse.json({
        success: true,
        demoMode: true,
        status: 'disconnected',
        // Return a mock QR code for testing
        qr: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://capten.app',
        notice: "Mode Démo actif. Configurez WHAPI_TOKEN sur Vercel pour lier un vrai WhatsApp."
      });
    }

    // 1. Check if already connected by querying /users/me
    try {
      const meRes = await fetch('https://gate.whapi.cloud/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        next: { revalidate: 0 }
      });

      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData && meData.id) {
          return NextResponse.json({
            success: true,
            demoMode: false,
            status: 'connected',
            phone: meData.id.split('@')[0], // Extract phone from e.g. "33612345678@s.whatsapp.net"
            pushname: meData.pushname || 'WhatsApp Connected'
          });
        }
      }
    } catch (e) {
      console.log('User not connected or API error checking /me');
    }

    // 2. If not connected, fetch the login QR code
    const qrRes = await fetch('https://gate.whapi.cloud/users/login', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    if (qrRes.ok) {
      const qrData = await qrRes.json();
      return NextResponse.json({
        success: true,
        demoMode: false,
        status: qrData.status === 'connected' ? 'connected' : 'disconnected',
        qr: qrData.qr || null // base64 string
      });
    } else {
      const errText = await qrRes.text();
      return NextResponse.json({
        success: false,
        error: `Failed to fetch login status: ${errText}`
      }, { status: qrRes.status });
    }

  } catch (error: any) {
    console.error('WhatsApp status API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = process.env.WHAPI_TOKEN || '';
    if (!token || token === '' || token.includes('votre_token_whapi_ici')) {
      return NextResponse.json({ success: true, demoMode: true, message: "Déconnexion simulée en mode Démo." });
    }

    const res = await fetch('https://gate.whapi.cloud/users/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      return NextResponse.json({ success: true, message: "Déconnecté de Whapi.cloud avec succès." });
    } else {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: `Failed to logout: ${errText}` }, { status: res.status });
    }
  } catch (error: any) {
    console.error('WhatsApp logout error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
