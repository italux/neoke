// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCd5YOPGaxCIJRY4hH6IBfajGIBpHYTbWs",
  authDomain: "neoke-f1dee.firebaseapp.com",
  projectId: "neoke-f1dee",
  storageBucket: "neoke-f1dee.appspot.com",
  messagingSenderId: "1067564682016",
  appId: "1:1067564682016:web:3e4cee7094becad19d2545",
  measurementId: "G-CV1CE6P2PZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };