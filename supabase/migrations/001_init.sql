-- ============================================================
-- BabicFIT V1 — Complete database schema + seed data
-- Run this once in Supabase SQL Editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id               uuid primary key references auth.users on delete cascade,
  first_name       text,
  last_name        text,
  gender           text check (gender in ('male','female')),
  birth_year       integer,
  height_cm        real,
  weight_kg        real,
  activity_level   text check (activity_level in ('sedentary','light','moderate','active')),
  goal             text check (goal in ('lose_weight','maintain','gain_muscle')),
  goal_calories    real,
  goal_protein_g   real,
  goal_carbs_g     real,
  goal_fat_g       real,
  onboarding_done  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Food categories ───────────────────────────────────────────
create table if not exists food_categories (
  id          text primary key,
  slug        text not null unique,
  name_sr     text not null,
  sort_order  integer not null default 0,
  icon        text
);

-- ── System foods ──────────────────────────────────────────────
create table if not exists system_foods (
  id            text primary key,
  category_id   text not null references food_categories(id),
  name_sr       text not null,
  name_en       text,
  search_name   text not null,
  calories_kcal real not null,
  protein_g     real not null,
  carbs_g       real not null,
  fat_g         real not null,
  unit_type     text not null default 'gram',
  unit_weight_g real,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists idx_sf_search   on system_foods(search_name);
create index if not exists idx_sf_category on system_foods(category_id);

-- ── User foods ────────────────────────────────────────────────
create table if not exists user_foods (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  category_id   text not null references food_categories(id),
  name_sr       text not null,
  search_name   text not null,
  calories_kcal real not null,
  protein_g     real not null,
  carbs_g       real not null,
  fat_g         real not null,
  unit_type     text not null default 'gram',
  unit_weight_g real,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists idx_uf_user on user_foods(user_id, search_name);

-- ── Daily logs ────────────────────────────────────────────────
create table if not exists daily_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  log_date        date not null,
  goal_calories   real not null default 0,
  goal_protein_g  real not null default 0,
  goal_carbs_g    real not null default 0,
  goal_fat_g      real not null default 0,
  total_calories  real not null default 0,
  total_protein_g real not null default 0,
  total_carbs_g   real not null default 0,
  total_fat_g     real not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, log_date)
);
create index if not exists idx_dl_user on daily_logs(user_id, log_date desc);

-- ── Meal entries ──────────────────────────────────────────────
create table if not exists meal_entries (
  id                 uuid primary key default gen_random_uuid(),
  daily_log_id       uuid not null references daily_logs(id) on delete cascade,
  meal_slot          text not null check (meal_slot in ('breakfast','lunch','dinner','snack1','snack2')),
  system_food_id     text references system_foods(id),
  user_food_id       uuid references user_foods(id),
  recipe_id          uuid,
  quantity_value     real not null,
  quantity_unit      text not null,
  entry_calories     real not null,
  entry_protein_g    real not null,
  entry_carbs_g      real not null,
  entry_fat_g        real not null,
  food_name_snapshot text not null,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create index if not exists idx_me_log  on meal_entries(daily_log_id);
create index if not exists idx_me_meal on meal_entries(daily_log_id, meal_slot);

-- ── Recipes ───────────────────────────────────────────────────
create table if not exists recipes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  name            text not null,
  servings        real not null default 1,
  total_calories  real not null default 0,
  total_protein_g real not null default 0,
  total_carbs_g   real not null default 0,
  total_fat_g     real not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists idx_rec_user on recipes(user_id, created_at desc);

create table if not exists recipe_items (
  id                      uuid primary key default gen_random_uuid(),
  recipe_id               uuid not null references recipes(id) on delete cascade,
  system_food_id          text references system_foods(id),
  user_food_id            uuid references user_foods(id),
  quantity_value          real not null,
  quantity_unit           text not null,
  snapshot_kcal_per100    real not null,
  snapshot_protein_per100 real not null,
  snapshot_carbs_per100   real not null,
  snapshot_fat_per100     real not null,
  food_name_snapshot      text not null,
  sort_order              integer not null default 0,
  created_at              timestamptz not null default now()
);
create index if not exists idx_ri_recipe on recipe_items(recipe_id);

-- ── FK: meal_entries → recipes ────────────────────────────────
do $$ begin
  alter table meal_entries
    add constraint fk_me_recipe
    foreign key (recipe_id) references recipes(id);
exception when duplicate_object then null;
end $$;

-- ── Row Level Security ────────────────────────────────────────
alter table profiles      enable row level security;
alter table user_foods    enable row level security;
alter table daily_logs    enable row level security;
alter table meal_entries  enable row level security;
alter table recipes       enable row level security;
alter table recipe_items  enable row level security;
alter table system_foods    enable row level security;
alter table food_categories enable row level security;

-- Public read for system tables
create policy "public_read_sf"  on system_foods    for select using (true);
create policy "public_read_cat" on food_categories for select using (true);

-- Profiles
create policy "own_profile" on profiles
  using (auth.uid() = id) with check (auth.uid() = id);

-- User foods
create policy "own_user_foods" on user_foods
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Daily logs
create policy "own_daily_logs" on daily_logs
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Meal entries (owned via daily_log)
create policy "own_meal_entries" on meal_entries
  using (exists (
    select 1 from daily_logs dl
    where dl.id = meal_entries.daily_log_id and dl.user_id = auth.uid()
  ));

-- Recipes
create policy "own_recipes" on recipes
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Recipe items (owned via recipe)
create policy "own_recipe_items" on recipe_items
  using (exists (
    select 1 from recipes r
    where r.id = recipe_items.recipe_id and r.user_id = auth.uid()
  ));

-- ── Auto-create profile on signup ─────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- SEED DATA
-- ============================================================

insert into food_categories (id, slug, name_sr, sort_order, icon) values
  ('cat-protein',   'protein',   'Proteini',        1, '🥩'),
  ('cat-carbs',     'carbs',     'Ugljeni hidrati',  2, '🌾'),
  ('cat-fat',       'fat',       'Masti',            3, '🫒'),
  ('cat-vegetable', 'vegetable', 'Povrće',           4, '🥦'),
  ('cat-fruit',     'fruit',     'Voće',             5, '🍎'),
  ('cat-other',     'other',     'Ostalo',           6, '🍽️')
on conflict do nothing;

insert into system_foods
  (id, category_id, name_sr, name_en, search_name, calories_kcal, protein_g, carbs_g, fat_g, unit_type, unit_weight_g) values

-- PROTEINI
('sf-pileca-prsa',   'cat-protein','Pileća prsa',       'Chicken Breast',          'pileca prsa',        165,31,  0,   3.6, 'gram', null),
('sf-piletina-file', 'cat-protein','Piletina file',     'Chicken Fillet (raw)',    'piletina file',      110,23,  0,   1.5, 'gram', null),
('sf-curece-belo',   'cat-protein','Ćureće belo meso',  'Turkey Breast',           'curece belo meso',   135,30,  0,   1,   'gram', null),
('sf-govedina',      'cat-protein','Govedina mlevena',  'Ground Beef 90% lean',    'govedina mlevena',   215,26,  0,   12,  'gram', null),
('sf-svinjski-file', 'cat-protein','Svinjski file',     'Pork Tenderloin',         'svinjski file',      143,22,  0,   6,   'gram', null),
('sf-losos',         'cat-protein','Losos',             'Salmon Atlantic',         'losos',              208,20,  0,   13,  'gram', null),
('sf-tuna-konzerva', 'cat-protein','Tuna (konzerva)',   'Tuna canned in water',    'tuna konzerva',      116,26,  0,   1,   'gram', null),
('sf-skusa',         'cat-protein','Skuša',             'Mackerel',                'skusa',              205,19,  0,   14,  'gram', null),
('sf-jaje',          'cat-protein','Jaje (celo)',       'Egg whole',               'jaje celo',          155,13,  1.1, 11,  'piece',60),
('sf-belance',       'cat-protein','Belance',           'Egg White',               'belance',            52, 11,  0.7, 0.2, 'piece',33),
('sf-grcki-jogurt',  'cat-protein','Grčki jogurt (0%)','Greek Yogurt 0%',          'grcki jogurt',       59, 10,  3.6, 0.4, 'gram', null),
('sf-svezi-sir',     'cat-protein','Svježi sir',        'Cottage Cheese',          'svjezi sir',         98, 11,  3.4, 4.3, 'gram', null),
('sf-whey',          'cat-protein','Whey protein',      'Whey Protein Powder',     'whey protein',       380,80,  5,   3,   'gram', null),
('sf-jogurt',        'cat-protein','Jogurt (2.8%)',     'Yogurt 2.8% fat',         'jogurt',             61, 3.5, 4.7, 3.1, 'gram', null),

-- UGLJENI HIDRATI
('sf-pirinac',          'cat-carbs','Pirinač (kuvan)',        'White Rice cooked',         'pirinac kuvan',       130,2.7,28,  0.3, 'gram', null),
('sf-pirinac-smedi',    'cat-carbs','Pirinač smeđi (kuvan)',  'Brown Rice cooked',         'pirinac smedi kuvan', 123,2.7,26,  0.9, 'gram', null),
('sf-ovsene',           'cat-carbs','Ovsene pahuljice',       'Rolled Oats',               'ovsene pahuljice',    389,17, 66,  7,   'gram', null),
('sf-krompir',          'cat-carbs','Krompir (kuvan)',        'Potato boiled',             'krompir kuvan',       87, 1.9,20,  0.1, 'gram', null),
('sf-slatki-krompir',   'cat-carbs','Slatki krompir',        'Sweet Potato cooked',       'slatki krompir',      86, 1.6,20,  0.1, 'gram', null),
('sf-testenina',        'cat-carbs','Testenina (kuvana)',     'Pasta cooked',              'testenina kuvana',    131,5,  25,  1.1, 'gram', null),
('sf-hleb-beli',        'cat-carbs','Hleb beli',             'White Bread',               'hleb beli',           265,9,  49,  3.2, 'piece',30),
('sf-hleb-integralni',  'cat-carbs','Hleb integralni',       'Whole Wheat Bread',         'hleb integralni',     247,13, 41,  4.2, 'piece',30),
('sf-kvinoja',          'cat-carbs','Kvinoja (kuvana)',      'Quinoa cooked',             'kvinoja kuvana',      120,4.4,21,  1.9, 'gram', null),
('sf-palenta',          'cat-carbs','Palenta (kuvana)',      'Polenta cooked',            'palenta kuvana',      70, 1.7,15,  0.7, 'gram', null),
('sf-plazma',           'cat-carbs','Plazma keks',           'Plazma Biscuit',            'plazma keks',         448,9,  68,  16,  'piece',10),
('sf-musli',            'cat-carbs','Musli (bez šećera)',    'Muesli no added sugar',     'musli bez secera',    360,10, 66,  6,   'gram', null),

-- MASTI
('sf-maslinovo-ulje',    'cat-fat','Maslinovo ulje',    'Olive Oil',               'maslinovo ulje',     884,0,   0,   100, 'ml',   null),
('sf-suncokretovo-ulje', 'cat-fat','Suncokretovo ulje', 'Sunflower Oil',           'suncokretovo ulje',  884,0,   0,   100, 'ml',   null),
('sf-puter',             'cat-fat','Puter',             'Butter',                  'puter',              717,0.9, 0.1, 81,  'gram', null),
('sf-avokado',           'cat-fat','Avokado',           'Avocado',                 'avokado',            160,2,   9,   15,  'gram', null),
('sf-bademi',            'cat-fat','Bademi',            'Almonds',                 'bademi',             579,21,  22,  50,  'gram', null),
('sf-orasi',             'cat-fat','Orasi',             'Walnuts',                 'orasi',              654,15,  14,  65,  'gram', null),
('sf-lesnici',           'cat-fat','Lešnici',           'Hazelnuts',               'lesnici',            628,15,  17,  61,  'gram', null),
('sf-kikiriki-puter',    'cat-fat','Kikiriki puter',    'Peanut Butter',           'kikiriki puter',     588,25,  20,  50,  'gram', null),
('sf-sir-gauda',         'cat-fat','Sir Gauda',         'Gouda Cheese',            'sir gauda',          356,25,  2.2, 28,  'gram', null),
('sf-kajmak',            'cat-fat','Kajmak',            'Kajmak cream cheese',     'kajmak',             350,3,   3,   36,  'gram', null),

-- POVRĆE
('sf-brokoli',       'cat-vegetable','Brokoli',         'Broccoli',                'brokoli',            34, 2.8, 7,   0.4, 'gram', null),
('sf-spinat',        'cat-vegetable','Špinat',          'Spinach',                 'spinat',             23, 2.9, 3.6, 0.4, 'gram', null),
('sf-paprika',       'cat-vegetable','Paprika crvena',  'Red Bell Pepper',         'paprika crvena',     31, 1,   6,   0.3, 'gram', null),
('sf-paradajz',      'cat-vegetable','Paradajz',        'Tomato',                  'paradajz',           18, 0.9, 3.9, 0.2, 'gram', null),
('sf-krastavac',     'cat-vegetable','Krastavac',       'Cucumber',                'krastavac',          15, 0.7, 3.6, 0.1, 'gram', null),
('sf-tikvice',       'cat-vegetable','Tikvice',         'Zucchini',                'tikvice',            17, 1.2, 3.1, 0.3, 'gram', null),
('sf-kupus',         'cat-vegetable','Kupus',           'Cabbage',                 'kupus',              25, 1.3, 5.8, 0.1, 'gram', null),
('sf-mrkva',         'cat-vegetable','Mrkva',           'Carrot',                  'mrkva',              41, 0.9, 10,  0.2, 'gram', null),
('sf-pecurke',       'cat-vegetable','Pečurke',         'Mushrooms button',        'pecurke sampinjoni', 22, 3.1, 3.3, 0.3, 'gram', null),
('sf-luk',           'cat-vegetable','Luk crni',        'Onion',                   'luk crni',           40, 1.1, 9.3, 0.1, 'gram', null),
('sf-beli-luk',      'cat-vegetable','Beli luk',        'Garlic',                  'beli luk',           149,6.4, 33,  0.5, 'gram', null),
('sf-patlidzan',     'cat-vegetable','Patlidžan',       'Eggplant',                'patlidzan',          25, 1,   6,   0.2, 'gram', null),
('sf-salata',        'cat-vegetable','Zelena salata',   'Lettuce romaine',         'zelena salata',      15, 1.4, 2.9, 0.2, 'gram', null),
('sf-ajvar',         'cat-vegetable','Ajvar',           'Ajvar roasted pepper',    'ajvar',              100,1,   12,  6,   'gram', null),

-- VOĆE
('sf-banana',    'cat-fruit','Banana',    'Banana',        'banana',    89, 1.1,23,  0.3, 'piece',120),
('sf-jabuka',    'cat-fruit','Jabuka',    'Apple',         'jabuka',    52, 0.3,14,  0.2, 'piece',180),
('sf-jagode',    'cat-fruit','Jagode',    'Strawberries',  'jagode',    32, 0.7,7.7, 0.3, 'gram', null),
('sf-borovnice', 'cat-fruit','Borovnice', 'Blueberries',   'borovnice', 57, 0.7,14,  0.3, 'gram', null),
('sf-narandza',  'cat-fruit','Narandža',  'Orange',        'narandza',  47, 0.9,12,  0.1, 'piece',200),
('sf-lubenica',  'cat-fruit','Lubenica',  'Watermelon',    'lubenica',  30, 0.6,7.6, 0.2, 'gram', null),
('sf-kruska',    'cat-fruit','Kruška',    'Pear',          'kruska',    57, 0.4,15,  0.1, 'piece',180),
('sf-malina',    'cat-fruit','Malina',    'Raspberries',   'malina',    52, 1.2,12,  0.7, 'gram', null),
('sf-kivi',      'cat-fruit','Kivi',      'Kiwi',          'kivi',      61, 1.1,15,  0.5, 'piece',80),
('sf-sljiva',    'cat-fruit','Šljiva',    'Plum',          'sljiva',    46, 0.7,11,  0.3, 'piece',60),
('sf-grozde',    'cat-fruit','Grožđe',    'Grapes',        'grozde',    69, 0.7,18,  0.2, 'gram', null),

-- OSTALO
('sf-mleko',    'cat-other','Mleko (2.8%)', 'Milk 2.8%',               'mleko',       50, 3.4,4.8, 2.8, 'ml',   null),
('sf-kafa',     'cat-other','Kafa (crna)',  'Coffee black',             'kafa crna',   2,  0.3,0,   0,   'ml',   null),
('sf-burek',    'cat-other','Burek (meso)', 'Burek with meat',          'burek meso',  280,12, 25,  14,  'gram', null),
('sf-gibanica', 'cat-other','Gibanica',    'Gibanica cheese pie',      'gibanica',    260,10, 22,  15,  'gram', null)

on conflict do nothing;
