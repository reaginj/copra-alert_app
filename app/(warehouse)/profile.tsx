import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import ProfileInfoCard from '@/components/copra/ProfileInfoCard';
import SettingRow from '@/components/copra/SettingRow';
import { auth, db } from '@/config/firebase';

type WarehouseProfileData = {
  displayName: string;
  email: string;
  contactNumber: string;
  warehouseName: string;
  warehouseLocation: string;
};

export default function WarehouseProfile() {
  const popupScale = useRef(new Animated.Value(0.96)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<WarehouseProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(popupScale, {
        toValue: 1,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [popupOpacity, popupScale]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setErrorMessage('No logged-in user found.');
          return;
        }

        const userSnap = await getDoc(doc(db, 'users', user.uid));

        if (!userSnap.exists()) {
          setErrorMessage('No user profile document found.');
          return;
        }

        const data = userSnap.data();

        setProfile({
          displayName: data.displayName || 'Warehouse User',
          email: data.email || user.email || '',
          contactNumber: data.contactNumber || '',
          warehouseName: data.warehouseName || '',
          warehouseLocation: data.warehouseLocation || '',
        });
      } catch (error: any) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const showPlaceholder = (label: string) => {
    Alert.alert(label, 'This setting will be available soon.');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.log(error);
    }
  };

  const closeProfile = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(warehouse)/warehouse' as any);
  };

  return (
    <Animated.View style={[styles.screen, { opacity: popupOpacity }]}>
      <SafeAreaView style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeProfile} />

        <Animated.View style={[styles.popupCard, { transform: [{ scale: popupScale }] }]}>
          <TouchableOpacity style={styles.closeButton} activeOpacity={0.85} onPress={closeProfile}>
            <Ionicons name="close" size={22} color="#4B3426" />
          </TouchableOpacity>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator size="large" color="#1F5C43" />
                <Text style={styles.stateText}>Loading warehouse profile...</Text>
              </View>
            ) : errorMessage ? (
              <View style={styles.stateCard}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : profile ? (
              <ProfileInfoCard
                name={profile.displayName || 'Warehouse User'}
                email={profile.email}
                avatarIcon="business-outline"
                items={[
                  { label: 'Role', value: 'Warehouse', icon: 'business-outline' },
                  { label: 'Contact Number', value: profile.contactNumber || 'Not set', icon: 'call-outline' },
                  { label: 'Warehouse Name', value: profile.warehouseName || 'Not set', icon: 'business-outline' },
                  { label: 'Warehouse Location', value: profile.warehouseLocation || 'Not set', icon: 'map-outline' },
                ]}
              />
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Warehouse Settings</Text>

              <SettingRow
                icon="create-outline"
                label="Edit Warehouse Profile"
                onPress={() => showPlaceholder('Edit Warehouse Profile')}
              />
              <SettingRow
                icon="lock-closed-outline"
                label="Change Password"
                onPress={() => showPlaceholder('Change Password')}
              />
              <SettingRow
                icon="log-out-outline"
                label="Logout"
                onPress={handleLogout}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  popupCard: {
    width: '100%',
    maxHeight: '90%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#F7EFE3',
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  content: {
    width: '100%',
  },
  contentContainer: {
    padding: 18,
    paddingTop: 42,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 14,
    top: 12,
    zIndex: 2,
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DDCF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B3426',
    marginBottom: 12,
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 30,
    alignItems: 'center',
  },
  stateText: {
    fontSize: 14,
    color: '#4B3426',
    fontWeight: '700',
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#A43A2F',
    fontWeight: '700',
    textAlign: 'center',
  },
});
