// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFfX3zGjGC4vCOlzaNZH3YEMgngsZfOJg",
  authDomain: "inventory-management-27236.firebaseapp.com",
  projectId: "inventory-management-27236",
  storageBucket: "inventory-management-27236.appspot.com",
  messagingSenderId: "649139209533",
  appId: "1:649139209533:web:ea9ca3270edc675d737154",
  measurementId: "G-Z7M8CQXB30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Initialize Analytics if supported
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { firestore, analytics };
