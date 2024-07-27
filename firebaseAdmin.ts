import { App, getApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

var admin = require('firebase-admin');

var serviceAccount = require('./service-key.json');

let app: App;

if (getApps().length === 0) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);

export { app as adminApp, adminDb, adminStorage };
