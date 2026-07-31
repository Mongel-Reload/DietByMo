-- =====================================================================
-- DietTrackbyMo — Skema Database Supabase
-- Jalankan skrip ini di Supabase SQL Editor (Project > SQL Editor > New query)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabel profiles
--    Menyimpan data profil tambahan tiap pengguna (1:1 dengan auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  height_cm numeric,
  initial_weight numeric,
  target_weight numeric,
  activity_level text default 'sedang' check (activity_level in ('rendah', 'sedang', 'tinggi', 'sangat_tinggi')),
  daily_water_target_ml integer default 2000,
  daily_step_target integer default 8000,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Tabel exercise_logs — laporan olahraga harian
-- ---------------------------------------------------------------------
create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  exercise_type text not null,
  duration_minutes integer not null default 0,
  intensity text not null default 'sedang' check (intensity in ('ringan', 'sedang', 'berat')),
  calories_burned integer default 0,
  steps integer default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_exercise_logs_user_date on public.exercise_logs (user_id, date desc);

-- ---------------------------------------------------------------------
-- 3. Tabel weight_logs — laporan berat badan mingguan
-- ---------------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight_kg numeric not null,
  waist_cm numeric,
  body_fat_percent numeric,
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_weight_logs_user_date on public.weight_logs (user_id, date);

-- ---------------------------------------------------------------------
-- 4. Tabel habit_logs — habit tracker harian (satu baris per hari)
-- ---------------------------------------------------------------------
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  exercise_done boolean not null default false,
  water_ml integer not null default 0,
  veggies_done boolean not null default false,
  sleep_hours numeric not null default 0,
  no_sugar_drink boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists idx_habit_logs_user_date on public.habit_logs (user_id, date);

-- ---------------------------------------------------------------------
-- 5. Tabel food_journal — jurnal makanan harian
-- ---------------------------------------------------------------------
create table if not exists public.food_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('sarapan', 'makan_siang', 'makan_malam', 'camilan')),
  food_name text not null,
  calories integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_food_journal_user_date on public.food_journal (user_id, date);

-- =====================================================================
-- FUNGSI BANTUAN: is_admin()
-- Menggunakan security definer agar bisa mengecek tabel profiles tanpa
-- terjebak rekursi RLS pada tabel profiles itu sendiri.
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- Setiap pengguna hanya bisa melihat & mengubah datanya sendiri.
-- Admin (is_admin = true) diberi akses baca (select) ke semua data
-- untuk keperluan dashboard admin.
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.habit_logs enable row level security;
alter table public.food_journal enable row level security;

-- ---- profiles ----
create policy "Profil: lihat milik sendiri atau admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Profil: buat milik sendiri"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profil: ubah milik sendiri"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---- exercise_logs ----
create policy "Olahraga: lihat milik sendiri atau admin"
  on public.exercise_logs for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Olahraga: tambah milik sendiri"
  on public.exercise_logs for insert
  with check (auth.uid() = user_id);

create policy "Olahraga: ubah milik sendiri"
  on public.exercise_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Olahraga: hapus milik sendiri"
  on public.exercise_logs for delete
  using (auth.uid() = user_id);

-- ---- weight_logs ----
create policy "Berat: lihat milik sendiri atau admin"
  on public.weight_logs for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Berat: tambah milik sendiri"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Berat: ubah milik sendiri"
  on public.weight_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Berat: hapus milik sendiri"
  on public.weight_logs for delete
  using (auth.uid() = user_id);

-- ---- habit_logs ----
create policy "Kebiasaan: lihat milik sendiri atau admin"
  on public.habit_logs for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Kebiasaan: tambah milik sendiri"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Kebiasaan: ubah milik sendiri"
  on public.habit_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Kebiasaan: hapus milik sendiri"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

-- ---- food_journal ----
create policy "Jurnal: lihat milik sendiri atau admin"
  on public.food_journal for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Jurnal: tambah milik sendiri"
  on public.food_journal for insert
  with check (auth.uid() = user_id);

create policy "Jurnal: ubah milik sendiri"
  on public.food_journal for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Jurnal: hapus milik sendiri"
  on public.food_journal for delete
  using (auth.uid() = user_id);

-- =====================================================================
-- STORAGE: bucket untuk foto progres berat badan
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

create policy "Foto progres: siapa saja bisa lihat (bucket publik)"
  on storage.objects for select
  using (bucket_id = 'progress-photos');

create policy "Foto progres: unggah ke folder milik sendiri"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Foto progres: hapus milik sendiri"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- CATATAN
-- =====================================================================
-- 1. Untuk menjadikan seorang pengguna sebagai admin, jalankan setelah
--    pengguna tersebut mendaftar:
--
--    update public.profiles set is_admin = true where id = '<user-id-di-sini>';
--
-- 2. Trigger opsional agar baris profiles otomatis dibuat saat sign up
--    (aplikasi ini juga sudah membuatnya lewat kode di sisi client,
--    tapi trigger di bawah ini bisa dipakai sebagai jaring pengaman):
--
-- create or replace function public.handle_new_user()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- begin
--   insert into public.profiles (id, full_name)
--   values (new.id, new.raw_user_meta_data->>'full_name')
--   on conflict (id) do nothing;
--   return new;
-- end;
-- $$;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
