-- ============================================================
-- LinkVault - Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- FOLDERS TABLE
-- ============================================================
create table if not exists public.folders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#6c63ff',
  icon text default '📁',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- LINKS TABLE
-- ============================================================
create table if not exists public.links (
  id uuid default uuid_generate_v4() primary key,
  folder_id uuid references public.folders(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  name text,
  description text,
  type text default 'link', -- 'link' | 'youtube' | 'video'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Folders RLS
alter table public.folders enable row level security;

create policy "Users can view own folders"
  on public.folders for select
  using (auth.uid() = user_id);

create policy "Users can insert own folders"
  on public.folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own folders"
  on public.folders for update
  using (auth.uid() = user_id);

create policy "Users can delete own folders"
  on public.folders for delete
  using (auth.uid() = user_id);

-- Links RLS
alter table public.links enable row level security;

create policy "Users can view own links"
  on public.links for select
  using (auth.uid() = user_id);

create policy "Users can insert own links"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "Users can update own links"
  on public.links for update
  using (auth.uid() = user_id);

create policy "Users can delete own links"
  on public.links for delete
  using (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_folders_updated_at
  before update on public.folders
  for each row execute procedure public.handle_updated_at();

create trigger handle_links_updated_at
  before update on public.links
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Done! Your LinkVault database is ready.
-- ============================================================
