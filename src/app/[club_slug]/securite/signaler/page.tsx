import { getSupabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClubSecuriteSignalerRedirectPage({ params }: { params: { club_slug: string } }) {
  const supabase = getSupabaseAdmin();
  let clubId = "";

  if (supabase) {
    const { data: clubs } = await supabase.from('clubs').select('id, whatsapp_display_name');
    const matchingClub = clubs?.find(c => {
      const slug = c.whatsapp_display_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      return slug === params.club_slug;
    });
    
    if (matchingClub) {
      clubId = matchingClub.id;
    }
  }

  if (clubId) {
    redirect(`/securite/signaler?clubId=${encodeURIComponent(clubId)}`);
  }

  redirect('/securite/signaler');
}
