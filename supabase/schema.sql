
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CATEGORIES TABLE
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS TABLE
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  price decimal(10,2) not null,
  sale_price decimal(10,2),
  description text,
  fabric text,
  care text,
  sizes text[] not null default '{}', -- Array of strings e.g. ['S', 'M', 'L']
  stock integer default 0,
  featured boolean default false,
  launch_date date not null default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category_id uuid references public.categories(id)
);

-- PRODUCT IMAGES TABLE
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  image_url text not null,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS TABLE (Phase 1 & 2)
create type payment_method_type as enum ('COD', 'ONLINE');
create type payment_status_type as enum ('PENDING', 'PAID', 'FAILED');
create type order_status_type as enum ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique, -- Friendly ID e.g. ORD-1001
  customer_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null, -- Snapshot of items ordered: [{ product_id, name, price, quantity, size }]
  total decimal(10,2) not null,
  payment_method payment_method_type not null default 'COD',
  payment_status payment_status_type not null default 'PENDING',
  order_status order_status_type not null default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS (Row Level Security)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;

-- POLICIES

-- Public Read Access
create policy "Public categories are viewable by everyone" on public.categories for select using (true);
create policy "Public products are viewable by everyone" on public.products for select using (true); -- Filter by launch_date in application query or view
create policy "Public product images are viewable by everyone" on public.product_images for select using (true);

-- Admin Full Access (Assume authenticated users with specific role or just authenticated for this MVP/Single Admin)
-- For simplicity in this startup phase, we allow ALL authenticated users to manage content (assuming only Admin logs in)
-- PROD TIP: Implement role-based access logic here.
create policy "Authenticated users can insert orders" on public.orders for insert with check (true); -- Public/Guest checkout needs anon access? Or maybe insert only?
-- Actually, Orders usually need generic insert access if guest checkout.
create policy "Anyone can create orders" on public.orders for insert with check (true);
create policy "Service role or Admin can view orders" on public.orders for select using (auth.role() = 'authenticated');

-- Product Management
create policy "Authenticated users can manage products" on public.products using (auth.role() = 'authenticated');
create policy "Authenticated users can manage categories" on public.categories using (auth.role() = 'authenticated');
create policy "Authenticated users can manage product_images" on public.product_images using (auth.role() = 'authenticated');

-- STORAGE BUCKETS
-- You'll need to create a bucket named 'product-images' in Supabase Storage.
