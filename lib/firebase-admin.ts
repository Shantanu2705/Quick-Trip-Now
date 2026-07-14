export async function getAdminServices() {
  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (!getApps().length) {
      if (process.env.FIREBASE_PRIVATE_KEY) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, '\n');
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
        if (privateKey.startsWith("'") && privateKey.endsWith("'")) privateKey = privateKey.slice(1, -1);

        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });
      }
    }

    return { 
      adminAuth: getApps().length ? getAuth() : null, 
      adminDb: getApps().length ? getFirestore() : null 
    };
  } catch (error: any) {
    console.error("Firebase dynamic import crash:", error);
    return { adminAuth: null, adminDb: null, crashError: error.message || String(error) };
  }
}
