-- ============================================================
-- Comfot — Supabase Schema
-- Run this in the Supabase SQL editor once.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. guest_pii
--    Off-chain PII keyed by contract guest_id.
--    hotel_address scopes every row to a specific hotel.
-- ────────────────────────────────────────────────────────────
create table if not exists public.guest_pii (
  id              uuid primary key default gen_random_uuid(),
  guest_id        text not null,          -- matches contract guest_id ("guest_1" etc.)
  hotel_address   text not null,          -- connected wallet address (lowercase)
  guest_ref       text not null,          -- matches contract guest_ref
  full_name       text,
  email           text,
  phone           text,
  nationality     text,
  passport_number text,
  date_of_birth   date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (guest_id, hotel_address)
);

-- ────────────────────────────────────────────────────────────
-- 2. hotel_contacts
--    Email / notification prefs per hotel wallet address.
-- ────────────────────────────────────────────────────────────
create table if not exists public.hotel_contacts (
  id              uuid primary key default gen_random_uuid(),
  hotel_address   text not null unique,
  hotel_name      text,
  contact_email   text,
  notify_escalations  boolean not null default true,
  notify_finalized    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 3. notifications
--    Log of every notification sent to hotel staff.
-- ────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  hotel_address   text not null,
  type            text not null,   -- 'escalation' | 'finalized' | 'rejected'
  subject         text not null,
  body            text not null,
  rec_id          text,
  escalation_id   text,
  tx_hash         text,
  sent_at         timestamptz not null default now(),
  delivered       boolean not null default false,
  error           text
);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────
create index if not exists idx_guest_pii_hotel    on public.guest_pii (hotel_address);
create index if not exists idx_guest_pii_guest_id on public.guest_pii (guest_id);
create index if not exists idx_notifications_hotel on public.notifications (hotel_address);

-- ────────────────────────────────────────────────────────────
-- updated_at trigger
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_guest_pii on public.guest_pii;
create trigger set_updated_at_guest_pii
  before update on public.guest_pii
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_hotel_contacts on public.hotel_contacts;
create trigger set_updated_at_hotel_contacts
  before update on public.hotel_contacts
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- RLS: all reads/writes go through service-role API routes,
-- so RLS can stay disabled for simplicity.
-- Enable and add policies here if you add Supabase Auth later.
-- ────────────────────────────────────────────────────────────
alter table public.guest_pii        disable row level security;
alter table public.hotel_contacts   disable row level security;
alter table public.notifications    disable row level security;
