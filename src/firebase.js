import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBqcOmRpj3aVsE6fEdGjpPcJJ9LkgE5MVs",
  authDomain: "multiply-monsters-classroom.firebaseapp.com",
  projectId: "multiply-monsters-classroom",
  storageBucket: "multiply-monsters-classroom.firebasestorage.app",
  messagingSenderId: "230177138179",
  appId: "1:230177138179:web:6540840277a13917ae1036"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);