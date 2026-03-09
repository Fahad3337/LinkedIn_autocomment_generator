-- ============================================================================
-- CommentFlow Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- 1. Profiles (linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Templates (DM message templates)
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  message text not null,
  lead_magnet_url text,
  is_default boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Campaigns (monitored LinkedIn posts)
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete restrict,
  post_url text not null,
  post_title text,
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. Delivery Logs (every DM / connection request)
create table if not exists public.delivery_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  commenter_name text not null,
  commenter_profile_url text not null,
  event_type text not null check (event_type in ('dm_sent', 'connection_requested', 'reply_posted')),
  status text default 'pending' check (status in ('success', 'failed', 'pending')),
  error_message text,
  created_at timestamptz default now() not null
);

-- Indexes for fast queries
create index if not exists idx_templates_user on public.templates(user_id);
create index if not exists idx_campaigns_user on public.campaigns(user_id);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_delivery_logs_campaign on public.delivery_logs(campaign_id);
create index if not exists idx_delivery_logs_user on public.delivery_logs(user_id);
create index if not exists idx_delivery_logs_created on public.delivery_logs(created_at desc);

-- Row Level Security (RLS) — users can only access their own data
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.delivery_logs enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Templates: users can CRUD their own templates
create policy "Users can view own templates" on public.templates for select using (auth.uid() = user_id);
create policy "Users can create templates" on public.templates for insert with check (auth.uid() = user_id);
create policy "Users can update own templates" on public.templates for update using (auth.uid() = user_id);
create policy "Users can delete own templates" on public.templates for delete using (auth.uid() = user_id);

-- Campaigns: users can CRUD their own campaigns
create policy "Users can view own campaigns" on public.campaigns for select using (auth.uid() = user_id);
create policy "Users can create campaigns" on public.campaigns for insert with check (auth.uid() = user_id);
create policy "Users can update own campaigns" on public.campaigns for update using (auth.uid() = user_id);
create policy "Users can delete own campaigns" on public.campaigns for delete using (auth.uid() = user_id);

-- Delivery Logs: users can view/create their own logs
create policy "Users can view own logs" on public.delivery_logs for select using (auth.uid() = user_id);
create policy "Users can create logs" on public.delivery_logs for insert with check (auth.uid() = user_id);

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
create trigger set_templates_updated_at before update on public.templates for each row execute function public.handle_updated_at();
create trigger set_campaigns_updated_at before update on public.campaigns for each row execute function public.handle_updated_at();
