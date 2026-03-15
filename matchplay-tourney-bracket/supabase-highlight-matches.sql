-- =============================================================================
-- HIGHLIGHT MATCHES TABLE (required for "Highlight Matches" feature)
-- =============================================================================
-- Run this entire file in the Supabase Dashboard → SQL Editor.
-- Stores 2 admin-picked match IDs per bracket: Winner's (WB) and Loser's (LB).
-- Single row: wb_match_1, wb_match_2, lb_match_1, lb_match_2 (all nullable).
-- =============================================================================

create table if not exists public.highlight_matches (
  id int primary key default 1 check (id = 1),
  wb_match_1 int,
  wb_match_2 int,
  lb_match_1 int,
  lb_match_2 int
);

-- Ensure single row
insert into public.highlight_matches (id, wb_match_1, wb_match_2, lb_match_1, lb_match_2)
values (1, null, null, null, null)
on conflict (id) do nothing;

-- No RLS: data is not sensitive; table is fully public for read/write.
alter table public.highlight_matches disable row level security;

-- =============================================================================
-- If you already have the OLD table with match_id_1, match_id_2, run this
-- once to migrate to the new columns (then deploy the new app code):
-- =============================================================================
-- alter table public.highlight_matches add column if not exists wb_match_1 int;
-- alter table public.highlight_matches add column if not exists wb_match_2 int;
-- alter table public.highlight_matches add column if not exists lb_match_1 int;
-- alter table public.highlight_matches add column if not exists lb_match_2 int;
-- update public.highlight_matches set wb_match_1 = match_id_1, wb_match_2 = match_id_2 where id = 1;
-- alter table public.highlight_matches drop column if exists match_id_1;
-- alter table public.highlight_matches drop column if exists match_id_2;
