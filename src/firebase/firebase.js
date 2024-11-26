// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "rbac-ui.firebaseapp.com",
  projectId: "rbac-ui",
  storageBucket: "rbac-ui.firebasestorage.app",
  messagingSenderId: "601671050028",
  appId: "1:601671050028:web:b341956ca847fc62674289",
  measurementId: "G-JHEZ3HFHE9"
 
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth=getAuth(app);
const db=getFirestore(app);
export {app,analytics,auth,db}