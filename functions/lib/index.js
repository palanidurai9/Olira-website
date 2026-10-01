"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryShipment = exports.assignAdminClaim = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const razorpay_1 = require("./payments/razorpay");
const claims_1 = require("./admin/claims");
const shiprocket_1 = require("./shipping/shiprocket");
// Initialize Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * Callable Function: Create Razorpay Order
 */
exports.createRazorpayOrder = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    try {
        return await (0, razorpay_1.handleCreateRazorpayOrder)(request.data);
    }
    catch (err) {
        throw new https_1.HttpsError('internal', err.message);
    }
});
/**
 * Callable Function: Verify Razorpay Payment Signature
 */
exports.verifyRazorpayPayment = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    try {
        return await (0, razorpay_1.handleVerifyRazorpayPayment)(request.data);
    }
    catch (err) {
        throw new https_1.HttpsError('invalid-argument', err.message);
    }
});
/**
 * Callable Function: Assign Admin Custom Claim
 */
exports.assignAdminClaim = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    try {
        const { targetUid } = request.data;
        if (!targetUid) {
            throw new https_1.HttpsError('invalid-argument', 'Target user UID is required');
        }
        return await (0, claims_1.setAdminUserRole)(targetUid, request.auth);
    }
    catch (err) {
        throw new https_1.HttpsError('permission-denied', err.message);
    }
});
/**
 * Callable Function: Retry Shiprocket order creation
 */
exports.retryShipment = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Only administrators can trigger shipping retries.');
    }
    const { orderId } = request.data;
    const docSnap = await admin.firestore().collection('orders').doc(orderId).get();
    if (!docSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Order not found');
    }
    await (0, shiprocket_1.createShiprocketOrder)(orderId, docSnap.data());
    return { success: true, message: 'Shiprocket creation triggered.' };
});
//# sourceMappingURL=index.js.map