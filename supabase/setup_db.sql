-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables & Types (Drop if exists for clean slate)
drop table if exists public.product_images;
drop table if exists public.products;
drop table if exists public.categories;
drop table if exists public.orders;
drop type if exists payment_method_type;
drop type if exists payment_status_type;
drop type if exists order_status_type;

create type payment_method_type as enum ('COD', 'ONLINE');
create type payment_status_type as enum ('PENDING', 'PAID', 'FAILED');
create type order_status_type as enum ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  price decimal(10,2) not null,
  sale_price decimal(10,2),
  description text,
  fabric text,
  care text,
  sizes text[] not null default '{}',
  stock integer default 0,
  featured boolean default false,
  launch_date date not null default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category_id uuid references public.categories(id)
);

-- Product Images Table
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  image_url text not null,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null,
  total decimal(10,2) not null,
  payment_method payment_method_type not null default 'COD',
  payment_status payment_status_type not null default 'PENDING',
  order_status order_status_type not null default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;

-- 4. Create Policies
-- Categories: Everyone can read
create policy "Public categories are viewable by everyone" on public.categories for select using (true);
create policy "Authenticated users can manage categories" on public.categories using (auth.role() = 'authenticated');

-- Products: Everyone can read
create policy "Public products are viewable by everyone" on public.products for select using (true);
create policy "Authenticated users can manage products" on public.products using (auth.role() = 'authenticated');

-- Product Images: Everyone can read
create policy "Public product images are viewable by everyone" on public.product_images for select using (true);
create policy "Authenticated users can manage product_images" on public.product_images using (auth.role() = 'authenticated');

-- Orders: Everyone can insert, Authenticated/Admin can read/update
create policy "Everyone can insert orders" on public.orders for insert with check (true);
create policy "Admins can view all orders" on public.orders for select using (auth.role() = 'authenticated');
create policy "Admins can update orders" on public.orders for update using (auth.role() = 'authenticated');

-- 5. Seed Initial Data (Categories)
insert into public.categories (name, slug) values
('Maxi Dresses', 'maxi-dress'),
('Kurti Sets', 'kurti-set'),
('Tops', 'tops'),
('Shirts', 'shirts'),
('Maternity', 'maternity-dress')
on conflict (slug) do nothing;
