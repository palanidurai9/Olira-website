# OLIRAA — "Modesty Made Modern"

A production-grade women's fashion e-commerce platform built with React, Vite, TypeScript, Tailwind CSS, and powered by Firebase, Razorpay, Shiprocket, and Resend.

---

## Architecture Overview

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend & Database**: Firebase Authentication, Cloud Firestore, Firebase Storage, Firebase Cloud Functions
- **Payment Processing**: Razorpay (Dual-mode: Server-side order creation + signature verification)
- **Logistics & Shipping**: Shiprocket API integration (AWB generation, label, live tracking)
- **Email Notifications**: Resend API (Order confirmation, invoice, dispatch updates)
- **Security**: Custom claims-based role management (`role: 'admin'`), atomic stock reduction via Firestore transactions, strict Firestore & Storage security rules

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase web app keys and Razorpay Key ID:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## Seed Initial Catalog & Categories

Populate the Firestore database with standard categories (Maxi Dresses, Kurti Sets, Tops, Shirts, Maternity Dresses), sample variant-configured products, and promo coupons:

1. Download your Firebase service account key from **Firebase Console > Project Settings > Service accounts > Generate new private key**.
2. Save it in the project root as `serviceAccountKey.json`.
3. Run the seed script:
```bash
node scripts/seed.js
```

---

## Granting Admin Access

To grant an existing user full administrative permissions (`role: 'admin'`) via Firebase Auth Custom Claims:

```bash
node scripts/set-admin.js admin@oliraa.com
```

Once granted, the user can log in at `/admin/login` and access `/admin/*`.

---

## Firebase Deployment

### Deploy Security Rules & Indexes
```bash
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

### Deploy Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Set server-side secrets in Firebase Functions:
```bash
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set SHIPROCKET_EMAIL
firebase functions:secrets:set SHIPROCKET_PASSWORD
firebase functions:secrets:set RESEND_API_KEY
```
