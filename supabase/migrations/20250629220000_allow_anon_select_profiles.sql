-- Drop existing policy
drop policy if exists "Allow anon select" on profiles;

-- Enable RLS on profiles table
alter table profiles enable row level security;

-- Allow anon users to select from profiles
create policy "Allow anon select" on profiles
  for select
  to anon
  using (true);
