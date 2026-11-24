create table if not exists attendance_days (
  user_id text not null,
  day date not null,
  primary key (user_id, day)
);

create table if not exists course_grades (
  user_id text not null,
  course_id text not null,
  score integer not null,
  comment text not null default '',
  graded_by text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
