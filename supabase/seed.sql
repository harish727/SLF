-- Seed test users for local development

-- Create auth users with all required fields
insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'athlete@test.com',
  crypt('Test@123', gen_salt('bf')),
  now(), now(), now(),
  '{"first_name":"John","last_name":"Athlete","role":"athlete"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'coach@test.com',
  crypt('Test@123', gen_salt('bf')),
  now(), now(), now(),
  '{"first_name":"Jane","last_name":"Coach","role":"coach"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, '', '', '', ''
) on conflict do nothing;

-- Identities (required for email/password login to work)
insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at, last_sign_in_at)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'athlete@test.com',
  'email',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"athlete@test.com"}'::jsonb,
  now(), now(), now()
),
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'coach@test.com',
  'email',
  '{"sub":"00000000-0000-0000-0000-000000000002","email":"coach@test.com"}'::jsonb,
  now(), now(), now()
) on conflict do nothing;

-- Profiles
insert into profiles (id, first_name, last_name, role, timezone)
values (
  '00000000-0000-0000-0000-000000000001',
  'John', 'Athlete', 'athlete', 'Asia/Kolkata'
),
(
  '00000000-0000-0000-0000-000000000002',
  'Jane', 'Coach', 'coach', 'Asia/Kolkata'
) on conflict do nothing;

-- Athlete profile
insert into athlete_profiles (profile_id, training_age_years, sport, height_cm, training_frequency)
values (
  '00000000-0000-0000-0000-000000000001',
  5, 'Powerlifting', 180, 4
) on conflict do nothing;

-- Coach-Athlete relationship
insert into coach_athletes (coach_id, athlete_id, status, started_at)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'active', current_date
) on conflict do nothing;
