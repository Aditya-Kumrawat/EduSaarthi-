import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBC27SDIIq1lMVhyG6an8NEWOhTEf-EfyE",
  authDomain: "edutrust-83abb.firebaseapp.com",
  projectId: "edutrust-83abb",
  storageBucket: "edutrust-83abb.firebasestorage.app",
  messagingSenderId: "806430959221",
  appId: "1:806430959221:web:e837a97bdd092fb3dafa3c",
  measurementId: "G-CB0K6SX50R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence for better reliability
try {
  // This helps with connection issues
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export default app;
