import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDWzxVnAEgRk4ttZ6Mdg3nm9rxsoiien6g",
  authDomain: "copra-alert.firebaseapp.com",
  projectId: "copra-alert",
  storageBucket: "copra-alert.firebasestorage.app",
  messagingSenderId: "1071958541479",
  appId: "1:1071958541479:web:142b29c9498d9d570e8782",
  measurementId: "G-WKKLDQKDHK"
};

const app = initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };