// Southern Stock Take — Firebase shared cloud setup
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, limit, writeBatch } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAG4zuUM6DtCNyk-eV3QSn7f9zNkDEx_pU',
  authDomain: 'southern-stock-take.firebaseapp.com',
  projectId: 'southern-stock-take',
  storageBucket: 'southern-stock-take.firebasestorage.app',
  messagingSenderId: '491924589823',
  appId: '1:491924589823:web:6262f29bddcf89057f90ca'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const STORE_ID = 'southern';

export {
  app, auth, db, storage, STORE_ID, googleProvider,
  signInWithPopup, onAuthStateChanged, signOut,
  collection, doc, setDoc, getDoc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, limit, writeBatch,
  ref, uploadBytes, getDownloadURL, deleteObject
};
