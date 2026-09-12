import { getSession } from '@/lib/auth/session';
import { getProgressByUserId } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ProgressShell } from '@/components/progress/ProgressShell';

export default async function ProgressPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = getProgressByUserId(session.userId);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 text-sm">No progress data available yet.</p>
      </div>
    );
  }

  return <ProgressShell data={data} />;
}
