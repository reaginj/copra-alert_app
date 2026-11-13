import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: (
      storage: typeof ReactNativeAsyncStorage
    ) => Persistence;
  }
).getReactNativePersistence;

const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);

export { auth, db };
