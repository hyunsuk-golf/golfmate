-- 사용자 프로필
create table profiles (
  id uuid references auth.users on delete cascade,
  name text,
  account_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- 라운딩
create table roundings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  golf_course text not null,
  date date not null,
  tee_time text,
  region text,
  player_count integer default 4,
  players jsonb default '[]',
  memo text,
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 정산
create table settlements (
  id uuid default gen_random_uuid() primary key,
  rounding_id uuid references roundings(id) on delete cascade,
  green_fee integer default 0,
  cart_fee integer default 0,
  caddie_fee integer default 0,
  meal_fee integer default 0,
  other_fee integer default 0,
  total_fee integer default 0,
  per_person integer default 0,
  payer_name text,
  account_number text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
