/**
 * OLIRAA Admin Claim Assignment Script
 * 
 * Usage:
 * 1. Download your Firebase service account private key JSON from:
 *    Firebase Console -> Project Settings -> Service accounts -> Generate new private key
 * 2. Save it in the project root as `serviceAccountKey.json` (do not commit to Git!)
 * 3. Run:
 *    node scripts/set-admin.js <admin-email>
 * 
 * Example:
 *    node scripts/set-admin.js admin@oliraa.com
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const email = process.argv[2];

if (!email) {
  console.error('\x1b[31mError: Please provide the target user email address.\x1b[0m');
  console.log('Usage: node scripts/set-admin.js <user-email>');
  process.exit(1);
}

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\x1b[31mError: serviceAccountKey.json not found in project root.\x1b[0m');
  console.log('\nPlease follow these steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Navigate to Project Settings > Service accounts');
  console.log('3. Click "Generate new private key"');
  console.log('4. Save the downloaded file as "serviceAccountKey.json" in the root directory: ' + path.resolve(__dirname, '..'));
  console.log('5. Re-run this script: node scripts/set-admin.js ' + email);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdminClaim(targetEmail) {
  try {
    console.log(`\x1b[34mLocating Firebase Auth user for email: ${targetEmail}...\x1b[0m`);
    const user = await admin.auth().getUserByEmail(targetEmail);
    
    console.log(`Found user: ${user.uid} (${user.email})`);
    
    // Set custom user claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin',
      admin: true
    });

    // Also update their Firestore user profile document if it exists
    const db = admin.firestore();
    const userDocRef = db.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      await userDocRef.update({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Updated user profile role in Firestore.');
    } else {
      await userDocRef.set({
        uid: user.uid,
        email: targetEmail,
        role: 'admin',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log('Created user profile document in Firestore with role: admin.');
    }

    console.log(`\n\x1b[32m✔ SUCCESS: User ${targetEmail} has been granted the 'admin' role!\x1b[0m`);
    console.log('\x1b[33mNote: If the user is currently logged in, they must log out and log back in for token claims to refresh.\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31mFailed to set admin claim:\x1b[0m', error.message || error);
    process.exit(1);
  }
}

setAdminClaim(email);
