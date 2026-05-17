import { useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthBrandHeader from '@/components/copra/AuthBrandHeader';
import AuthCard from '@/components/copra/AuthCard';
import { AuthRole } from '@/components/copra/RoleSelector';
import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

type Role = AuthRole;
type AuthMode = 'login' | 'register';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const goToRolePage = (userRole: Role) => {
    if (userRole === 'farmer') {
      router.replace('/(farmer)/dashboard_farmer' as any);
    } else {
      router.replace('/(warehouse)/warehouse' as any);
    }
  };

  const formatRole = (userRole: Role) => {
    return userRole === 'farmer' ? 'Farmer' : 'Warehouse';
  };

  const handleRegister = async () => {
    try {
      Keyboard.dismiss();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const { user } = userCredential;
      const fallbackDisplayName = email.trim().split('@')[0];

      if (role === 'farmer') {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'farmer',
          displayName: fallbackDisplayName,
          contactNumber: '',
          farmName: '',
          farmLocation: '',
          ownerVerificationStatus: 'not_requested',
          isVerifiedOwner: false,
          profileCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'warehouse',
          displayName: fallbackDisplayName,
          contactNumber: '',
          warehouseName: '',
          warehouseLocation: '',
          profileCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      Alert.alert('Success', 'Account created!');
      goToRolePage(role);
    } catch (error: any) {
      Alert.alert('Register Error', error.message);
    }
  };

  const handleLogin = async () => {
    try {
      Keyboard.dismiss();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        Alert.alert('Error', 'Account profile not found.');
        return;
      }

      const data = userSnap.data();

      if (data.role !== 'farmer' && data.role !== 'warehouse') {
        await signOut(auth);
        Alert.alert('Error', 'Invalid user role found.');
        return;
      }

      if (role !== data.role) {
        await signOut(auth);
        Alert.alert(
          'Role Mismatch',
          `Role mismatch. This account is registered as ${formatRole(
            data.role
          )}. Please choose the correct role.`
        );
        return;
      }

      goToRolePage(data.role);
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topAccent} />
        <View style={styles.bottomAccent} />

        <AuthBrandHeader />

        <AuthCard
          mode={mode}
          email={email}
          password={password}
          selectedRole={role}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRoleChange={setRole}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onModeChange={setMode}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE3',
    padding: 24,
    justifyContent: 'center',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#4A3728',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  bottomAccent: {
    position: 'absolute',
    left: -34,
    bottom: -34,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#D8B57A',
    opacity: 0.28,
  },
});
