'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// ── Validation schemas ────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
});

const SignupSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  email:     z.string().email(),
  password:  z.string().min(8),
});

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginAction(
  email: string,
  password: string
): Promise<{ error: string } | { redirect: string }> {
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) return { error: 'validation' };

  console.log('=== LOGIN DEBUG ===');
  console.log('Email:', parsed.data.email);
  console.log('Password length:', parsed.data.password.length);
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = await createClient();
  console.log('Supabase client created');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    console.log('Auth response:', {
      hasUser: !!data?.user,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      error: error?.message,
      errorCode: error?.code,
      errorStatus: error?.status,
    });

    if (error) {
      console.log('Auth error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        cause: error.cause,
      });
      return { error: 'credentials' };
    }

    if (!data.user) {
      console.log('No user returned from auth');
      return { error: 'credentials' };
    }

    console.log('User authenticated:', data.user.id);

    // Fetch profile to determine routing
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    console.log('Profile fetch:', { profile, profileError });

    if (!data.user.email_confirmed_at) {
      console.log('Email not confirmed');
      return { redirect: '/verify-email' };
    }

    if (profile?.role === 'coach') {
      console.log('Redirecting to coach dashboard');
      return { redirect: '/coach' };
    }

    console.log('Redirecting to athlete dashboard');
    return { redirect: '/' };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { error: 'credentials' };
  }
}

// ── Signup ────────────────────────────────────────────────────────────────────

export async function signupAction(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ error: string } | { redirect: string }> {
  const parsed = SignupSchema.safeParse({ firstName, lastName, email, password });
  if (!parsed.success) return { error: 'validation' };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name:  parsed.data.lastName,
        role:       'athlete',
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) return { error: 'email_taken' };
    return { error: 'unknown' };
  }

  return { redirect: '/onboarding' };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ── Onboarding ────────────────────────────────────────────────────────────────

const OnboardingSchema = z.object({
  dob:           z.string(),
  gender:        z.string(),
  height:        z.string(),
  weight:        z.string(),
  experience:    z.string(),
  discipline:    z.string(),
  goals:         z.array(z.string()),
  daysPerWeek:   z.number().int().min(1).max(7),
  preferredDays: z.array(z.string()),
});

export async function completeOnboardingAction(
  profile: z.infer<typeof OnboardingSchema>
): Promise<void> {
  const parsed = OnboardingSchema.safeParse(profile);
  if (!parsed.success) redirect('/onboarding');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('athlete_profiles')
    .upsert({
      profile_id:             user.id,
      training_age_years:     parseFloat(parsed.data.experience) || null,
      sport:                  parsed.data.discipline,
      height_cm:              parseFloat(parsed.data.height) || null,
      preferred_training_days: parsed.data.preferredDays,
      training_frequency:     parsed.data.daysPerWeek,
    });

  if (error) redirect('/onboarding');
  redirect('/');
}
