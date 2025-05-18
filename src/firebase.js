// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDxHWadwZt0fdk0WmGSFgoSU7OG56cpIZk",
  authDomain: "expense-tracker-f3024.firebaseapp.com",
  projectId: "expense-tracker-f3024",
  storageBucket: "expense-tracker-f3024.firebasestorage.app",
  messagingSenderId: "759880823309",
  appId: "1:759880823309:web:0a5b019f1fd1d5967a1b44",
  measurementId: "G-ZWGTWJ5YM7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
