create extension if not exists "uuid-ossp";

create type price_range as enum ('¥', '¥¥', '¥¥¥');

create table places (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name_en text not null,
  name_jp text not null,
  category text not null,
  address text not null,
  lat float not null,
  lng float not null,
  price_range price_range not null,
  hours_text text not null default '',
  cover_photo_url text,
  description_short_en text not null default '',
  description_short_jp text not null default '',
  description_long_en text not null default '',
  description_long_jp text not null default '',
  cash_only boolean not null default false,
  seating_capacity integer,
  created_at timestamptz not null default now()
);

create table place_attributes (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid not null references places(id) on delete cascade,
  key text not null,
  value_en text not null default '',
  value_jp text not null default ''
);

create table grading_dimensions (
  id uuid primary key default uuid_generate_v4(),
  name_en text not null,
  name_jp text not null,
  emoji text not null,
  "order" integer not null default 0,
  active boolean not null default true
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid not null references places(id) on delete cascade,
  display_name text not null,
  visited_on date not null,
  meal_ordered text not null,
  would_recommend boolean not null default true,
  comment text,
  created_at timestamptz not null default now()
);

create table review_grades (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references reviews(id) on delete cascade,
  dimension_id uuid not null references grading_dimensions(id) on delete cascade,
  score integer not null check (score between 1 and 5)
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid not null references reviews(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table places enable row level security;
alter table reviews enable row level security;
alter table review_grades enable row level security;
alter table notifications enable row level security;
alter table grading_dimensions enable row level security;
alter table place_attributes enable row level security;

-- Public read policies
create policy "public read places" on places for select using (true);
create policy "public read reviews" on reviews for select using (true);
create policy "public read grades" on review_grades for select using (true);
create policy "public read dimensions" on grading_dimensions for select using (true);
create policy "public read attributes" on place_attributes for select using (true);

-- Public insert for reviews (community trust model)
create policy "public insert reviews" on reviews for insert with check (true);
create policy "public insert grades" on review_grades for insert with check (true);
create policy "public insert notifications" on notifications for insert with check (true);
