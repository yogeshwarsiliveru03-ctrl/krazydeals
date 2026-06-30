// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7dIU9FpgwJAqxZkXH3IxHBX1YMiXxJu4",
  authDomain: "krazydeals-2b8a4.firebaseapp.com",
  projectId: "krazydeals-2b8a4",
  storageBucket: "krazydeals-2b8a4.firebasestorage.app",
  messagingSenderId: "261015279937",
  appId: "1:261015279937:web:ac7c466903426a397e69c0",
  measurementId: "G-NL2NE4SC9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);