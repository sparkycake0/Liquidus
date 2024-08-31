import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyA8v8-hyCgI4yxb0YvNKa6Ed4wxAnwi2Ig",
  authDomain: "todo-app-89f7d.firebaseapp.com",
  projectId: "todo-app-89f7d",
  storageBucket: "todo-app-89f7d.appspot.com",
  messagingSenderId: "270752213012",
  appId: "1:270752213012:web:be278031cd1951f8a2df01",
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
