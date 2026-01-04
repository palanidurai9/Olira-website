-- 1. Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add images array column if it doesn't exist (Safe update)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'images') THEN
        ALTER TABLE reviews ADD COLUMN images TEXT[];
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. Re-create Policies (Drop first to avoid "already exists" error)
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create reviews" ON reviews;
CREATE POLICY "Public can create reviews" ON reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');

-- 5. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Policies (Drop first to avoid errors)
DROP POLICY IF EXISTS "Public can upload review images" ON storage.objects;
CREATE POLICY "Public can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reviews');

DROP POLICY IF EXISTS "Public can view review images" ON storage.objects;
CREATE POLICY "Public can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'reviews');
