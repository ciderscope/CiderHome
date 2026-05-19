create extension if not exists "pgcrypto";

do $$ begin
  create type app_role as enum ('admin', 'cellar_manager', 'operator', 'quality_technician');
exception
  when duplicate_object then null;
end $$;

create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role app_role not null default 'operator',
  default_site_id uuid references sites(id),
  site_ids uuid[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function enforce_user_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from user_profiles where active = true) >= 1000 and new.active = true then
    raise exception 'Limite de 1000 utilisateurs actifs atteinte';
  end if;
  return new;
end;
$$;

drop trigger if exists user_profiles_limit on user_profiles;
create trigger user_profiles_limit
before insert on user_profiles
for each row execute function enforce_user_limit();

create table if not exists tanks (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  code text not null,
  name text not null,
  capacity_liters numeric not null check (capacity_liters > 0),
  current_volume_liters numeric not null default 0 check (current_volume_liters >= 0),
  content_lot_id uuid,
  status text not null default 'available',
  material text not null default 'inox',
  zone text not null default 'principal',
  position jsonb not null default '{"x":0,"y":0}',
  sensors text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, code)
);

create table if not exists lots (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  code text not null,
  product_type text not null,
  variety text,
  harvest_year integer not null,
  status text not null default 'planned',
  volume_liters numeric not null default 0,
  origin text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, code)
);

alter table tanks
  drop constraint if exists tanks_content_lot_id_fkey,
  add constraint tanks_content_lot_id_fkey foreign key (content_lot_id) references lots(id);

create table if not exists sub_lot_samples (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  lot_id uuid not null references lots(id) on delete cascade,
  code text not null,
  kind text not null,
  parent_sub_lot_id uuid references sub_lot_samples(id),
  volume_liters numeric,
  sample_size_ml numeric,
  storage_location text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, code)
);

create table if not exists operations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  type text not null,
  lot_id uuid references lots(id),
  sub_lot_id uuid references sub_lot_samples(id),
  tank_id uuid references tanks(id),
  operator_id uuid not null references user_profiles(id),
  started_at timestamptz not null,
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inputs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  category text not null,
  supplier text,
  batch_number text,
  quantity numeric not null default 0,
  unit text not null,
  lot_id uuid references lots(id),
  operation_id uuid references operations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  lot_id uuid references lots(id),
  sub_lot_id uuid references sub_lot_samples(id),
  tank_id uuid references tanks(id),
  sample_code text not null,
  measured_at timestamptz not null,
  analyst_id uuid not null references user_profiles(id),
  results jsonb not null default '{}',
  compliant boolean not null default true,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transfer_orders (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  code text not null,
  source_tank_id uuid not null references tanks(id),
  target_tank_id uuid not null references tanks(id),
  lot_id uuid not null references lots(id),
  sub_lot_id uuid references sub_lot_samples(id),
  requested_volume_liters numeric not null check (requested_volume_liters > 0),
  status text not null default 'draft',
  requested_by uuid not null references user_profiles(id),
  approved_by uuid references user_profiles(id),
  executed_by uuid references user_profiles(id),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  executed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, code)
);

create table if not exists traceability_events (
  id text primary key,
  site_id uuid not null references sites(id) on delete cascade,
  type text not null,
  lot_id uuid references lots(id),
  sub_lot_id uuid references sub_lot_samples(id),
  source_entity_type text,
  source_entity_id text,
  target_entity_type text,
  target_entity_id text,
  quantity_liters numeric,
  occurred_at timestamptz not null,
  actor_id uuid not null references user_profiles(id),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sensor_readings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  sensor_id text not null,
  tank_id uuid not null references tanks(id),
  measured_at timestamptz not null,
  metrics jsonb not null default '{}',
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id text primary key,
  site_id uuid not null references sites(id) on delete cascade,
  actor_id uuid not null references user_profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tanks_site on tanks(site_id);
create index if not exists idx_lots_site on lots(site_id);
create index if not exists idx_transfer_orders_site_status on transfer_orders(site_id, status);
create index if not exists idx_traceability_site_lot on traceability_events(site_id, lot_id);
create index if not exists idx_sensor_readings_tank_time on sensor_readings(tank_id, measured_at desc);

alter table sites enable row level security;
alter table user_profiles enable row level security;
alter table tanks enable row level security;
alter table lots enable row level security;
alter table sub_lot_samples enable row level security;
alter table operations enable row level security;
alter table inputs enable row level security;
alter table analyses enable row level security;
alter table transfer_orders enable row level security;
alter table traceability_events enable row level security;
alter table sensor_readings enable row level security;
alter table audit_logs enable row level security;

create or replace function auth_site_ids()
returns uuid[] language sql stable as $$
  select coalesce(site_ids, '{}') from user_profiles where id = auth.uid();
$$;

create or replace function auth_role()
returns app_role language sql stable as $$
  select role from user_profiles where id = auth.uid();
$$;

create policy "site scoped read tanks" on tanks for select using (auth_role() = 'admin' or site_id = any(auth_site_ids()));
create policy "site scoped read lots" on lots for select using (auth_role() = 'admin' or site_id = any(auth_site_ids()));
create policy "site scoped read transfer orders" on transfer_orders for select using (auth_role() = 'admin' or site_id = any(auth_site_ids()));

