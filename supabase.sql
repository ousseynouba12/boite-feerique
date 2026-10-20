create table lettres (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  date_lettre date not null,
  pdf_path text not null,
  ouverte_le timestamptz,
  created_at timestamptz default now()
);
alter table lettres enable row level security;
insert into storage.buckets (id, name, public) values ('lettres', 'lettres', false);
