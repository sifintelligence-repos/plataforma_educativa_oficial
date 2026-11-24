create table if not exists ingress_profiles (
  user_id text primary key,
  gmail text not null,
  role text not null,
  age integer not null,
  study_id text,
  teaches text,
  paid_claim text not null default 'no',
  payment_ref text,
  payment_status text not null default 'impago',
  document_name text,
  document_data text,
  password_salt text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists academy_classes (
  id serial primary key,
  author_id text not null,
  course_id text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists academy_events (
  id serial primary key,
  author_id text not null,
  title text not null,
  event_date text not null,
  event_time text not null,
  place text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists direct_messages (
  id serial primary key,
  from_user text not null,
  to_user text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists direct_messages_pair_idx on direct_messages (from_user, to_user, id);
