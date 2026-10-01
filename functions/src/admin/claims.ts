import * as admin from 'firebase-admin';

export async function setAdminUserRole(targetUid: string, callerAuth: any): Promise<{ success: boolean; message: string }> {
    // Only existing admins or first setup can grant admin roles
    if (callerAuth && callerAuth.token.role !== 'admin' && callerAuth.token.role !== 'superadmin') {
        throw new Error('Permission denied. Only administrators can assign admin roles.');
    }

    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });

    // Also update the Firestore user profile
    await admin.firestore().collection('users').doc(targetUid).set({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, message: `Admin privileges granted to UID ${targetUid}` };
}
