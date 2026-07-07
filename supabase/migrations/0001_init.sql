-- TinyWords 초기 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.

create extension if not exists "pgcrypto";

-- 아이 프로필 -------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  avatar     text,
  created_at timestamptz not null default now()
);
create index if not exists profiles_owner_idx on public.profiles(owner);

-- 단어 -------------------------------------------------------------------
create table if not exists public.words (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  term             text not null,
  meaning          text not null,
  alt_meanings     text[],
  example          text,
  image_url        text,
  emoji            text,
  category         text,
  difficulty       int  not null default 1,
  wrong_count      int  not null default 0,
  correct_count    int  not null default 0,
  streak           int  not null default 0,
  status           text not null default 'learning' check (status in ('learning','mastered')),
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists words_profile_idx on public.words(profile_id);

-- 테스트 결과 -------------------------------------------------------------
create table if not exists public.test_results (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  taken_at       timestamptz not null default now(),
  total          int not null,
  correct        int not null,
  wrong_word_ids uuid[] not null default '{}'
);
create index if not exists test_results_profile_idx on public.test_results(profile_id);

-- 부모 계정 설정 ----------------------------------------------------------
create table if not exists public.account_settings (
  owner              uuid primary key references auth.users(id) on delete cascade,
  pin_hash           text,
  tts_voice          text,
  tts_rate           numeric not null default 1.0,
  tts_pitch          numeric not null default 1.0,
  default_test_count int not null default 10,
  session_size       int not null default 8
);

-- RLS --------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.words            enable row level security;
alter table public.test_results     enable row level security;
alter table public.account_settings enable row level security;

drop policy if exists "profiles_owner" on public.profiles;
create policy "profiles_owner" on public.profiles
  for all using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists "words_owner" on public.words;
create policy "words_owner" on public.words
  for all using (
    profile_id in (select id from public.profiles where owner = auth.uid())
  ) with check (
    profile_id in (select id from public.profiles where owner = auth.uid())
  );

drop policy if exists "test_results_owner" on public.test_results;
create policy "test_results_owner" on public.test_results
  for all using (
    profile_id in (select id from public.profiles where owner = auth.uid())
  ) with check (
    profile_id in (select id from public.profiles where owner = auth.uid())
  );

drop policy if exists "account_settings_owner" on public.account_settings;
create policy "account_settings_owner" on public.account_settings
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- 단어 이미지 저장용 Storage 버킷 ----------------------------------------
insert into storage.buckets (id, name, public)
values ('word-images', 'word-images', true)
on conflict (id) do nothing;

drop policy if exists "word_images_read" on storage.objects;
create policy "word_images_read" on storage.objects
  for select using (bucket_id = 'word-images');

drop policy if exists "word_images_write" on storage.objects;
create policy "word_images_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'word-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "word_images_modify" on storage.objects;
create policy "word_images_modify" on storage.objects
  for update to authenticated
  using (bucket_id = 'word-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "word_images_remove" on storage.objects;
create policy "word_images_remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'word-images' and (storage.foldername(name))[1] = auth.uid()::text);
