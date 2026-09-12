import { getSession } from '@/lib/auth/session';
import { getTrainingByUserId } from '@/lib/db';
import { redirect } from 'next/navigation';
import { TrainShell } from '@/components/train/TrainShell';

export default async function TrainPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = getTrainingByUserId(session.userId);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 text-sm">No training program assigned yet.</p>
      </div>
    );
  }

  return <TrainShell data={data} />;
}
