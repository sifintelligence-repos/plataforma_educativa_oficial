create table if not exists lesson_progress (
  user_id text not null,
  lesson_id text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists material_flags (
  user_id text not null,
  material_id text not null,
  state text not null,
  primary key (user_id, material_id)
);

create table if not exists messages (
  id serial primary key,
  user_id text not null,
  professor_id text not null,
  sender text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_idx on messages (user_id, id);

create table if not exists event_rsvps (
  user_id text not null,
  event_id text not null,
  going boolean not null default true,
  primary key (user_id, event_id)
);

create table if not exists app_notes (
  user_id text not null,
  app_id text not null,
  payload text not null,
  primary key (user_id, app_id)
);

create table if not exists campus_ready (
  user_id text primary key
);
