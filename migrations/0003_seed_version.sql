alter table campus_ready add column if not exists seed_version text not null default 'v1';
