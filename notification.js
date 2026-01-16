import admin from "firebase-admin";

const encodedServiceAccountKey = process.env.FIREBASE_CREDENTIALS;

const serviceAccount = JSON.parse(
  Buffer.from(encodedServiceAccountKey, 'base64').toString('utf-8')
);

export const notify = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
