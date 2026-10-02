create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  external_id text not null,
  name text not null default 'Social customer',
  status text not null default 'New',
  product text,
  price text,
  budget text,
  quantity text,
  location text,
  requirements text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel, external_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  external_message_id text,
  channel text not null,
  direction text not null default 'inbound',
  text text not null default '',
  timestamp timestamptz not null default now(),
  raw jsonb,
  created_at timestamptz not null default now(),
  unique(channel, external_message_id)
);

create index if not exists customers_updated_at_idx on customers(updated_at desc);
create index if not exists messages_customer_id_idx on messages(customer_id);
create index if not exists messages_timestamp_idx on messages(timestamp desc);
