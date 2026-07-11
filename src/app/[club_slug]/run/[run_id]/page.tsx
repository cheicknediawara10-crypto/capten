import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClubRunRedirectPage({ params }: { params: { club_slug: string; run_id: string } }) {
  redirect(`/waiver?runId=${params.run_id}`);
}
