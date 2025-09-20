// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuwSGutSdmiJzo6xWEsZkh9syIfySAN6w",
  authDomain: "operacion-planazo.firebaseapp.com",
  projectId: "operacion-planazo",
  storageBucket: "operacion-planazo.firebasestorage.app",
  messagingSenderId: "754928935099",
  appId: "1:754928935099:web:8d014b2d56791d9f42899e",
  measurementId: "G-8TKVV7NV6R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
