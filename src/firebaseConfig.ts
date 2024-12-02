// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA-eVkDFqSXIy6bDeNibQFx_BXLbQ-t674",
    authDomain: "tesst-fa85d.firebaseapp.com",
    databaseURL: "https://tesst-fa85d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tesst-fa85d",
    storageBucket: "tesst-fa85d.firebasestorage.app",
    messagingSenderId: "505641203827",
    appId: "1:505641203827:web:336937380c677e2e471206",
    measurementId: "G-YEEXHY8WBN"
  };

// Khởi tạo Firebase app
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore database
const db = getFirestore(app);

export default db;
