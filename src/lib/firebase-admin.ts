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

  // Robust Private Key parsing
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // 1. Remove surrounding quotes if present (common copy-paste error)
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // 2. Handle escaped newlines (standard Vercel/Env format)
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Missing Firebase Admin credentials in environment variables. Skipping initialization.');
    return null;
  }

  // Basic validation to help debug without leaking the key
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
    console.error('Firebase Private Key seems malformed. It must contain "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----".');
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
