# Environment Variables Setup

This project uses **Firebase Admin SDK** for secure server-side operations and API routes. You must configure the following environment variables in your `.env.local` file for the application to work correctly.

## Required Variables

```env
# Existing Public Variables (Client Side)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# NEW: Firebase Admin SDK (Server Side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq... (key content) ...\n-----END PRIVATE KEY-----\n"
```

## How to get Firebase Admin Credentials:

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Go to **Project settings** (gear icon) > **Service accounts**.
4.  Click **Generate new private key**.
5.  Open the downloaded JSON file.
    -   `FIREBASE_PROJECT_ID`: Use `project_id`.
    -   `FIREBASE_CLIENT_EMAIL`: Use `client_email`.
    -   `FIREBASE_PRIVATE_KEY`: Use `private_key`.
        -   **Important**: Copy the key EXACTLY as it is in the JSON file, including `\n` characters. If pasting into Vercel or other cloud provider, ensure it handles newlines correctly. In `.env.local`, you can wrap it in double quotes as shown above.
