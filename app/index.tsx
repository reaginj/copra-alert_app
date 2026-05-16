import { useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthBrandHeader from '@/components/copra/AuthBrandHeader';
import AuthCard from '@/components/copra/AuthCard';
import { AuthRole } from '@/components/copra/RoleSelector';
import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

type Role = AuthRole;

export default function Login() {
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

      if (role === 'farmer') {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'farmer',
          displayName: '',
          contactNumber: '',
          location: '',
          farmName: '',
          farmLocation: '',
          ownerVerificationStatus: 'not_requested',
          isVerifiedOwner: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'warehouse',
          displayName: '',
          contactNumber: '',
          location: '',
          warehouseName: '',
          warehouseLocation: '',
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
        <AuthBrandHeader />

        <AuthCard
          email={email}
          password={password}
          selectedRole={role}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRoleChange={setRole}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8ED',
    padding: 24,
    justifyContent: 'center',
  },
});
