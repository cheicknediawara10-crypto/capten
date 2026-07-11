import { getSupabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClubContribuerRedirectPage({ params }: { params: { club_slug: string } }) {
  const supabase = getSupabaseAdmin();
  let cagnotteUrl: string | null = null;

  if (supabase) {
    const { data: clubs } = await supabase.from('clubs').select('whatsapp_display_name, cagnotte_url');
    const matchingClub = clubs?.find(c => {
      const slug = c.whatsapp_display_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      return slug === params.club_slug;
    });
    
    if (matchingClub && matchingClub.cagnotte_url) {
      cagnotteUrl = matchingClub.cagnotte_url;
    }
  }

  if (cagnotteUrl) {
    redirect(`/cagnotte/contribuer?cagnotteUrl=${encodeURIComponent(cagnotteUrl)}`);
  }

  // Fallback if no matching club or no cagnotte configured
  redirect('/cagnotte/contribuer?error=no_cagnotte');
}
