// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'chat-to-pdf.firebaseapp.com',
  projectId: 'chat-to-pdf',
  storageBucket: 'chat-to-pdf.appspot.com',
  messagingSenderId: '531843713959',
  appId: '1:531843713959:web:7695a772b184e81ddb8482',
  measurementId: 'G-1R2STJ6PNJ',
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
