// =====================================================
// SOUTHERN STOCK TAKE
// Firebase Configuration + Auth + Firestore
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAG4zuUM6DtCNyk-eV3QSn7f9zNkDEx_pU",
  authDomain: "southern-stock-take.vercel.com",
  projectId: "southern-stock-take",
  storageBucket: "southern-stock-take.firebasestorage.app",
  messagingSenderId: "491924589823",
  appId: "1:491924589823:web:6262f29bddcf89057f90ca"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// Fungsi login guna Google
function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}


export {
  app,
  auth,
  db,

  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithGoogle,

  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
};
