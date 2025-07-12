// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpRAPfj9qTp-xAf8kk9SXQFOaeKdXZY50",
  authDomain: "next-expense-tracker-26a2c.firebaseapp.com",
  projectId: "next-expense-tracker-26a2c",
  storageBucket: "next-expense-tracker-26a2c.firebasestorage.app",
  messagingSenderId: "626860997528",
  appId: "1:626860997528:web:ba0d4756f11c7d3a7849ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)