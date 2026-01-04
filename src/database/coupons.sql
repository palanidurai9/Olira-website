-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC, -- Optional cap for percentage discounts
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access (necessary to validate coupons)
CREATE POLICY "Public can view active coupons" ON coupons
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users (Admins) full access
CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Update orders table to store discount info
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
