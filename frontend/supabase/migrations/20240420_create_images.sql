-- Create images table
create table if not exists public.images (
  id uuid default gen_random_uuid() primary key,
  original_url text not null,
  processed_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.images enable row level security;

-- Create a policy that allows all operations
create policy "Allow all operations" on public.images
  for all
  using (true)
  with check (true); 