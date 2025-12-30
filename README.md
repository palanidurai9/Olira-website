# Olira Website

A personalized e-commerce platform for Olira.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

## How to Clear Data

To reset dashboard stats (Sales, Orders), run this in your **Supabase SQL Editor**:

```sql
TRUNCATE TABLE orders CASCADE;
```
