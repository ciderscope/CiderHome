alter table tanks
  add column if not exists useful_capacity_liters numeric,
  add column if not exists temperature_c numeric,
  add column if not exists temperature_min_c numeric,
  add column if not exists temperature_max_c numeric,
  add column if not exists state text not null default 'vide',
  add column if not exists qr_code text;

alter table operations
  add column if not exists status text not null default 'draft',
  add column if not exists assignee_id uuid references user_profiles(id),
  add column if not exists planned_at timestamptz,
  add column if not exists validated_by uuid references user_profiles(id),
  add column if not exists validated_at timestamptz,
  add column if not exists volume_delta_liters numeric,
  add column if not exists checklist jsonb not null default '[]',
  add column if not exists required_fields text[] not null default '{}';

create table if not exists harvest_receipts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  lot_id uuid references lots(id),
  receipt_number text not null,
  parcel text not null,
  grape_variety text not null,
  supplier text,
  weight_kg numeric not null check (weight_kg > 0),
  maturity jsonb not null default '{}',
  received_at timestamptz not null default now(),
  assigned_tank_id uuid references tanks(id),
  document_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, receipt_number)
);

create table if not exists document_attachments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  filename text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes numeric,
  uploaded_by uuid not null references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  operation_id uuid references operations(id),
  code text not null,
  title text not null,
  status text not null default 'draft',
  assignee_id uuid references user_profiles(id),
  validator_id uuid references user_profiles(id),
  due_at timestamptz,
  checklist jsonb not null default '[]',
  required_fields text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, code)
);

create table if not exists stock_items (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  category text not null,
  supplier text,
  batch_number text not null,
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null,
  min_quantity numeric not null default 0,
  expiry_date date,
  location text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  stock_item_id uuid not null references stock_items(id),
  operation_id uuid references operations(id),
  lot_id uuid references lots(id),
  tank_id uuid references tanks(id),
  direction text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  reason text not null,
  moved_at timestamptz not null default now(),
  actor_id uuid not null references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists alert_rules (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  scope text not null,
  metric text not null,
  comparator text not null,
  threshold numeric not null,
  enabled boolean not null default true,
  channels text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists alerts (
  id text primary key,
  site_id uuid not null references sites(id) on delete cascade,
  rule_id uuid references alert_rules(id),
  entity_type text not null,
  entity_id text not null,
  severity text not null,
  message text not null,
  status text not null default 'open',
  triggered_at timestamptz not null default now(),
  acknowledged_by uuid references user_profiles(id),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bottling_batches (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  code text not null,
  lot_id uuid not null references lots(id),
  volume_liters numeric not null default 0,
  bottle_count integer not null default 0,
  bottled_at timestamptz,
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, code)
);

create index if not exists idx_harvest_receipts_site_time on harvest_receipts(site_id, received_at desc);
create index if not exists idx_work_orders_site_status on work_orders(site_id, status);
create index if not exists idx_stock_items_site_category on stock_items(site_id, category);
create index if not exists idx_alerts_site_status on alerts(site_id, status, triggered_at desc);

alter table harvest_receipts enable row level security;
alter table document_attachments enable row level security;
alter table work_orders enable row level security;
alter table stock_items enable row level security;
alter table stock_movements enable row level security;
alter table alert_rules enable row level security;
alter table alerts enable row level security;
alter table bottling_batches enable row level security;
