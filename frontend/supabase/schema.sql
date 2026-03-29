-- =============================================
-- Jas Volunteers — Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor → New Query)
-- =============================================

-- ===== 1. TEAMS TABLE =====
create table if not exists public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  logo_url text,
  instagram text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== 2. PROFILES TABLE =====
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text not null default '',
  last_name text not null default '',
  avatar_url text,
  role text not null default 'volunteer' check (role in ('volunteer', 'manager', 'admin', 'developer')),
  admin_position text check (admin_position in ('admin', 'deputy', null)),
  team_id uuid references public.teams(id),
  total_hours numeric default 0,
  total_events integer default 0,
  rank text default 'Новичок',
  penalties jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== 3. EVENTS TABLE =====
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  emoji text default '📋',
  team_id uuid references public.teams(id),
  created_by uuid references auth.users(id),
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  max_participants integer default 30,
  tags text[] default '{}',
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== 4. EVENT PARTICIPANTS TABLE =====
create table if not exists public.event_participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'registered' check (status in ('registered', 'attended', 'absent')),
  hours_earned numeric default 0,
  registered_at timestamptz default now(),
  checked_in_at timestamptz,
  unique(event_id, user_id)
);

-- ===== 5. ACHIEVEMENTS TABLE =====
create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  icon text default '🏅',
  earned_at timestamptz default now()
);

-- ===== 6. TEAM CREATION REQUESTS =====
create table if not exists public.team_requests (
  id uuid default gen_random_uuid() primary key,
  team_name text not null,
  description text,
  logo_url text,
  instagram text,
  requested_by uuid references auth.users(id) not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- ===== ROW LEVEL SECURITY =====

-- Enable RLS on all tables
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.achievements enable row level security;
alter table public.team_requests enable row level security;

-- PROFILES: Users can read all profiles, update only their own
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- TEAMS: Everyone can view approved teams, team creators can update
create policy "Approved teams are viewable by everyone" on public.teams
  for select using (status = 'approved');

create policy "Team creator can update own team" on public.teams
  for update using (auth.uid() = created_by);

-- EVENTS: Everyone can read active events, admins+ can create
create policy "Active events are viewable by everyone" on public.events
  for select using (true);

create policy "Admins can create events" on public.events
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'developer')
    )
  );

create policy "Event creator can update own events" on public.events
  for update using (auth.uid() = created_by);

-- EVENT PARTICIPANTS: Users can register themselves
create policy "Participants viewable by everyone" on public.event_participants
  for select using (true);

create policy "Users can register for events" on public.event_participants
  for insert with check (auth.uid() = user_id);

create policy "Admins can update participant status" on public.event_participants
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager', 'developer')
    )
  );

-- ACHIEVEMENTS: Viewable by everyone, system inserts
create policy "Achievements viewable by everyone" on public.achievements
  for select using (true);

-- TEAM REQUESTS: Requesters can see their own, developers see all
create policy "Users can view own team requests" on public.team_requests
  for select using (auth.uid() = requested_by);

create policy "Developers can view all team requests" on public.team_requests
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

create policy "Users can create team requests" on public.team_requests
  for insert with check (auth.uid() = requested_by);

create policy "Developers can update team requests" on public.team_requests
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'developer'
    )
  );

-- ===== TRIGGER: Auto-create profile on signup =====
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role, team_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'volunteer'),
    (new.raw_user_meta_data->>'team_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===== SEED: Insert some default approved teams =====
insert into public.teams (name, description, instagram, status) values
  ('Green Wave KZ', 'Экологическая команда волонтеров', '@greenwave_kz', 'approved'),
  ('Paws & Hearts', 'Помощь приютам для животных', '@paws_hearts', 'approved'),
  ('Bright Future', 'Образовательные проекты для детей', '@bright_future_kz', 'approved'),
  ('Helping Hand', 'Благотворительная помощь нуждающимся', '@helping_hand_kz', 'approved'),
  ('Eco Patrol', 'Защита природы Казахстана', '@eco_patrol', 'approved'),
  ('Tech4Good', 'IT-менторство и обучение', '@tech4good_kz', 'approved'),
  ('Youth Power', 'Молодежные инициативы', '@youth_power_kz', 'approved'),
  ('Kind Hearts', 'Добровольческие акции', '@kind_hearts_kz', 'approved')
on conflict (name) do nothing;
