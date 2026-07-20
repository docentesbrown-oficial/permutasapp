-- ============================================================
-- PERMUTAS DOCENTES BROWN - ESQUEMA INICIAL
-- Ejecutar completo desde Supabase > SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- 1) PERFILES PRIVADOS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null unique,
  preferred_districts text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos privados de cada docente. No se muestran antes del match.';

-- 2) PUESTOS PUBLICADOS
create table if not exists public.puestos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  pid text not null,
  school text not null,
  district text not null,
  schedule jsonb not null default '[]'::jsonb,
  status text not null default 'published'
    check (status in ('published', 'paused', 'matched', 'in_process', 'permuted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_is_array check (jsonb_typeof(schedule) = 'array')
);

create index if not exists puestos_pid_idx on public.puestos(pid);
create index if not exists puestos_district_idx on public.puestos(district);
create index if not exists puestos_user_idx on public.puestos(user_id);
create index if not exists puestos_status_idx on public.puestos(status);

-- 3) INTERESES: base para el match recíproco de la próxima etapa
create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.profiles(id) on delete cascade,
  offered_post_id uuid not null references public.puestos(id) on delete cascade,
  target_post_id uuid not null references public.puestos(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (offered_post_id, target_post_id),
  constraint different_posts check (offered_post_id <> target_post_id)
);

create index if not exists interests_requester_idx on public.interests(requester_user_id);
create index if not exists interests_target_idx on public.interests(target_post_id);

-- 4) ACTUALIZAR updated_at AUTOMÁTICAMENTE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists puestos_set_updated_at on public.puestos;
create trigger puestos_set_updated_at
before update on public.puestos
for each row execute function public.set_updated_at();

-- 5) CREAR PERFIL CUANDO SE REGISTRA UN USUARIO
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Docente'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'phone'), ''), 'Sin informar'),
    lower(new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 6) BLOQUEO REAL DEL DOMINIO: NO DEPENDE SOLO DEL FORMULARIO
create or replace function public.enforce_abc_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or lower(new.email) !~ '^[^@[:space:]]+@abc\.gob\.ar$' then
    raise exception 'Solo se admiten correos @abc.gob.ar';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_abc_email_on_signup on auth.users;
create trigger enforce_abc_email_on_signup
before insert on auth.users
for each row execute procedure public.enforce_abc_email();

-- Para desactivar temporalmente esta restricción:
-- drop trigger if exists enforce_abc_email_on_signup on auth.users;

-- 7) ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.puestos enable row level security;
alter table public.interests enable row level security;

-- Perfiles: cada docente solo accede al suyo.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Puestos: todos los usuarios autenticados pueden ver publicaciones activas.
-- Los datos personales quedan en profiles y no se exponen.
drop policy if exists "puestos_select_published_or_own" on public.puestos;
create policy "puestos_select_published_or_own"
on public.puestos for select
to authenticated
using (status = 'published' or auth.uid() = user_id);

drop policy if exists "puestos_insert_own" on public.puestos;
create policy "puestos_insert_own"
on public.puestos for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "puestos_update_own" on public.puestos;
create policy "puestos_update_own"
on public.puestos for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "puestos_delete_own" on public.puestos;
create policy "puestos_delete_own"
on public.puestos for delete
to authenticated
using (auth.uid() = user_id);

-- Intereses: el solicitante puede crear y ver los suyos.
-- El dueño del puesto objetivo puede ver intereses recibidos.
drop policy if exists "interests_select_involved" on public.interests;
create policy "interests_select_involved"
on public.interests for select
to authenticated
using (
  auth.uid() = requester_user_id
  or exists (
    select 1 from public.puestos target
    where target.id = target_post_id
      and target.user_id = auth.uid()
  )
);

drop policy if exists "interests_insert_valid" on public.interests;
create policy "interests_insert_valid"
on public.interests for insert
to authenticated
with check (
  auth.uid() = requester_user_id
  and exists (
    select 1 from public.puestos offered
    join public.puestos target on target.id = target_post_id
    where offered.id = offered_post_id
      and offered.user_id = auth.uid()
      and target.user_id <> auth.uid()
      and offered.pid = target.pid
      and offered.status = 'published'
      and target.status = 'published'
  )
);

drop policy if exists "interests_update_own" on public.interests;
create policy "interests_update_own"
on public.interests for update
to authenticated
using (auth.uid() = requester_user_id)
with check (auth.uid() = requester_user_id);

drop policy if exists "interests_delete_own" on public.interests;
create policy "interests_delete_own"
on public.interests for delete
to authenticated
using (auth.uid() = requester_user_id);
