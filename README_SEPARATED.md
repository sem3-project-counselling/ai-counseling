
Separated Frontend and Backend scaffold created from your ZIP.

Paths:
- Frontend: ./frontend  (Next.js app - client)
- Backend:  ./backend   (Express + firebase-admin APIs)

What I did (best-effort):
- Extracted client-side Next.js frontend files (excluded node_modules and .next).
- Created a backend Express scaffold and ported backend API routes (login/register/reset-password/firestore/storage).
- Added lib/firebaseAdmin.js for backend that initializes firebase-admin with env vars.
- Added frontend lib/firebaseClient.ts - put your Firebase client config here.
- Created .env.example for backend with placeholders for service account fields.

Files you should update now:
1) Frontend: ./frontend/lib/firebaseClient.ts
   - Replace the empty strings with your Firebase web app config (apiKey, authDomain, etc.).
   - You provided a firebaseConfig snippet; paste those values here.

2) Backend: ./backend/.env (create from .env.example)
   - Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (ensure newlines escaped as \n), FIREBASE_STORAGE_BUCKET, FIREBASE_DATABASE_URL.

3) Update frontend API base URL:
   - If your frontend code calls Next.js internal APIs, change calls like '/api/...' to your backend endpoints, e.g. 'http://localhost:5000/auth/login' or use an environment variable NEXT_PUBLIC_API_BASE_URL.

Quick start (local):
- Backend:
  cd backend
  npm install
  create a .env (from .env.example) and fill credentials
  npm run dev   # requires nodemon, or use node index.js

- Frontend:
  cd frontend
  npm install
  npm run dev    # Next.js dev server

Notes & caveats:
- I did not copy node_modules or .next to keep the package small. Install dependencies locally.
- The backend code I created is a simplified JS/Express port of the TypeScript Next.js API handlers in your original project. Test endpoints and adjust as needed.
- Ensure firebase-admin service account values are correct. The private key must keep \n escapes or use a JSON service account file and load it.
- You will need to change any imports in frontend that referred to server-side admin libs (I left admin server lib only in backend).

Downloaded scaffold ZIP:
- /mnt/data/login_registeration_separated.zip
