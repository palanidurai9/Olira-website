
-- Update the orders table policy to allow unauthenticated (public) users to insert new orders
-- This is essential for the public Checkout page to works with COD orders

-- First, drop the existing restrictive insert policy if it exists
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."orders";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."orders";

-- Create a new policy that allows everyone (anon + authenticated) to insert rows
-- The 'true' check means no restrictions on the rows being inserted (validation handled by application logic)
CREATE POLICY "Enable insert for all users" ON "public"."orders" 
FOR INSERT 
WITH CHECK (true);

-- Ensure RLS is still enabled (it should be, but good to double check)
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
