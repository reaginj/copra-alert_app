import { getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
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

const iotFirebaseConfig = {
  apiKey: "AIzaSyBAjWEqOLvmbEsJqjKymWbQu6Wa7z0uytU",
  authDomain: "copra-14c47.firebaseapp.com",
  databaseURL: "https://copra-14c47-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "copra-14c47",
  storageBucket: "copra-14c47.firebasestorage.app",
  messagingSenderId: "465547121120",
  appId: "1:465547121120:web:7cd564908a9fbbe2dc1b85",
  measurementId: "G-VLJ1HKCFVZ"
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

const iotAppName = 'copra-alert-iot';
const iotApp = getApps().find((firebaseApp) => firebaseApp.name === iotAppName)
  ?? initializeApp(iotFirebaseConfig, iotAppName);
const iotDb = getDatabase(iotApp);

export { auth, db, iotDb };
