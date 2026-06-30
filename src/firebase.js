import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7dIU9FpgwJAqxZkXH3IxHBX1YMiXxJu4",
  authDomain: "krazydeals-2b8a4.firebaseapp.com",
  projectId: "krazydeals-2b8a4",
  storageBucket: "krazydeals-2b8a4.firebasestorage.app",
  messagingSenderId: "261015279937",
  appId: "1:261015279937:web:ac7c466903426a397e69c0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

