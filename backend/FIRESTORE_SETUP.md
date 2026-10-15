# Firestore setup

The app uses Cloud Firestore for destinations, tours, experiences, reviews, site settings, CMS content, gallery metadata, and customer inquiries. The frontend uses Firebase's web SDK for public reads and inquiry submissions. The Express backend uses Firebase Admin for server-side data changes and admin-token verification.

## 1. Create the Firebase project

In the Firebase console, create or select a project, then create a **Cloud Firestore** database. Also register a Web app and enable **Authentication → Email/Password** if you will use the admin dashboard.

## 2. Configure the frontend

Copy `frontend/.env.example` to `frontend/.env.local` and fill in the six `NEXT_PUBLIC_FIREBASE_*` values from the Web app's Firebase config.

## 3. Configure trusted backend credentials

For local development, either log in with Google Application Default Credentials (`gcloud auth application-default login`) or create a service account key with Firestore access and store it outside the repository. Copy `backend/.env.example` to `backend/.env`, set `FIREBASE_PROJECT_ID`, and set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of the key file.

Never put the service-account key in `frontend/.env.local`, commit it, or expose it through a `NEXT_PUBLIC_*` variable. Deployed Google Cloud services should use their attached service identity instead of a downloaded key.

## 4. Deploy the security rules and indexes

From the `backend` directory, run:

```powershell
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project YOUR_FIREBASE_PROJECT_ID
```

The rules allow public reads only for published content and allow anonymous creation of validated inquiry documents. Admin writes require Firebase Authentication and an admin role or an `admins/{uid}` document with `role: "admin"`.

## 5. Seed the initial content

From the repository root, run:

```powershell
npm install --prefix backend
npm run seed:firestore --prefix backend
```

The idempotent seed command creates the site settings, destinations, tours, experiences, and reviews from the project seed data.

## 6. Grant an administrator

Create the intended admin user in Firebase Authentication. Copy that user's UID, then create a Firestore document at `admins/{UID}` with:

```json
{
  "role": "admin"
}
```

The backend verifies the Firebase ID token before checking this document. An email address containing the word `admin` does not grant access.

Start the backend and frontend with the existing development commands after both environment files are configured. The health endpoint reports Firestore connection status at `http://localhost:5001/api/health`.
