-- Estimates record both the market range and Raghav's own price (market x ratio) that the client saw.
alter table public.estimates
  add column my_low_cents integer not null default 0 check (my_low_cents >= 0),
  add column my_high_cents integer not null default 0 check (my_high_cents >= 0);
