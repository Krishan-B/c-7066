-- Allow public (anon) select on profiles for health check
create policy "Public can select for health check" on public.profiles
  for select
  using (true);
