import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export const initAdmin = (): App | null => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Handle newlines in private key which might be escaped in .env
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Missing Firebase Admin credentials in environment variables. Skipping initialization.');
    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
};

const app = initAdmin();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminAuth = app ? getAuth(app) : ({} as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminDb = app ? getFirestore(app) : ({} as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminStorage = app ? getStorage(app) : ({} as any);
