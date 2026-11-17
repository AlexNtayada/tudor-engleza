-- Tudoo! accounts: run once in Supabase → SQL Editor.
-- One row per parent account holding the whole family's progress (JSON).

create table if not exists public.families (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;

drop policy if exists "families: read own" on public.families;
drop policy if exists "families: insert own" on public.families;
drop policy if exists "families: update own" on public.families;
drop policy if exists "families: delete own" on public.families;

create policy "families: read own" on public.families for select to authenticated using (auth.uid() = user_id);
create policy "families: insert own" on public.families for insert to authenticated with check (auth.uid() = user_id);
create policy "families: update own" on public.families for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "families: delete own" on public.families for delete to authenticated using (auth.uid() = user_id);

-- "Șterge contul" in Settings: removes the signed-in parent and (by cascade) their saved progress.
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
