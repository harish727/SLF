import { createClient } from '@/lib/supabase/server';

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'athlete' | 'coach' | 'admin';
  emailVerified?: boolean;
  onboardingComplete?: boolean;
}

export async function getSession(): Promise<SessionPayload | null> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    email:  user.email ?? '',
    role:   profile?.role ?? 'athlete',
  };
}
