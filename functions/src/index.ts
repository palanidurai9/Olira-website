import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { handleCreateRazorpayOrder, handleVerifyRazorpayPayment } from './payments/razorpay';
import { setAdminUserRole } from './admin/claims';
import { createShiprocketOrder } from './shipping/shiprocket';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * Callable Function: Create Razorpay Order
 */
export const createRazorpayOrder = onCall({ region: 'asia-south1' }, async (request) => {
    try {
        return await handleCreateRazorpayOrder(request.data);
    } catch (err: any) {
        throw new HttpsError('internal', err.message);
    }
});

/**
 * Callable Function: Verify Razorpay Payment Signature
 */
export const verifyRazorpayPayment = onCall({ region: 'asia-south1' }, async (request) => {
    try {
        return await handleVerifyRazorpayPayment(request.data);
    } catch (err: any) {
        throw new HttpsError('invalid-argument', err.message);
    }
});

/**
 * Callable Function: Assign Admin Custom Claim
 */
export const assignAdminClaim = onCall({ region: 'asia-south1' }, async (request) => {
    try {
        const { targetUid } = request.data;
        if (!targetUid) {
            throw new HttpsError('invalid-argument', 'Target user UID is required');
        }
        return await setAdminUserRole(targetUid, request.auth);
    } catch (err: any) {
        throw new HttpsError('permission-denied', err.message);
    }
});

/**
 * Callable Function: Retry Shiprocket order creation
 */
export const retryShipment = onCall({ region: 'asia-south1' }, async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only administrators can trigger shipping retries.');
    }

    const { orderId } = request.data;
    const docSnap = await admin.firestore().collection('orders').doc(orderId).get();
    if (!docSnap.exists) {
        throw new HttpsError('not-found', 'Order not found');
    }

    await createShiprocketOrder(orderId, docSnap.data());
    return { success: true, message: 'Shiprocket creation triggered.' };
});
