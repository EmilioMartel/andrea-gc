// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCKU6m1rbWn_GHOc8GOeqRfiEaIhKuLaU",
  authDomain: "conocer-gc.firebaseapp.com",
  projectId: "conocer-gc",
  storageBucket: "conocer-gc.firebasestorage.app",
  messagingSenderId: "343236629846",
  appId: "1:343236629846:web:e311d94e6673a70fa472f7"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
