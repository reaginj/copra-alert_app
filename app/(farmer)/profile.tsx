import { useEffect, useState } from 'react';
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

type FarmerProfileData = {
  displayName: string;
  email: string;
  contactNumber: string;
  farmName: string;
  farmLocation: string;
};

export default function FarmerProfile() {
  const [popupScale] = useState(() => new Animated.Value(0.96));
  const [popupOpacity] = useState(() => new Animated.Value(0));
  const [profile, setProfile] = useState<FarmerProfileData | null>(null);
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
          displayName: data.displayName || 'Farmer User',
          email: data.email || user.email || '',
          contactNumber: data.contactNumber || '',
          farmName: data.farmName || '',
          farmLocation: data.farmLocation || '',
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

    router.replace('/(farmer)/dashboard_farmer' as any);
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
              <Text style={styles.stateText}>Loading farmer profile...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.stateCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : profile ? (
            <>
              <ProfileInfoCard
                name={profile.displayName || 'Farmer User'}
                email={profile.email}
                avatarIcon="leaf-outline"
                items={[
                  { label: 'Role', value: 'Farmer', icon: 'leaf-outline' },
                  { label: 'Contact Number', value: profile.contactNumber || 'Not set', icon: 'call-outline' },
                ]}
              />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farm Details</Text>

              <View style={styles.farmDetailRow}>
                <Text style={styles.farmDetailLabel}>Farm Name</Text>
                <Text style={styles.farmDetailValue}>{profile.farmName || 'Not set'}</Text>
              </View>

              <View style={styles.farmDetailRow}>
                <Text style={styles.farmDetailLabel}>Farm Location</Text>
                <Text style={styles.farmDetailValue}>{profile.farmLocation || 'Not set'}</Text>
              </View>

            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer Settings</Text>

              <SettingRow
                icon="create-outline"
                label="Edit Farmer Profile"
                onPress={() => showPlaceholder('Edit Farmer Profile')}
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

            </>
          ) : null}
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
    marginBottom: 30,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  editFarmButton: {
    backgroundColor: '#1F5C43',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editFarmButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  farmDetailRow: {
    backgroundColor: '#F7EFE3',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  farmDetailLabel: {
    fontSize: 12,
    color: '#6F6258',
    fontWeight: '700',
    marginBottom: 3,
  },
  farmDetailValue: {
    fontSize: 15,
    color: '#3D2B22',
    fontWeight: '800',
  },
  farmEditNote: {
    fontSize: 12,
    color: '#6F6258',
    fontWeight: '700',
    marginTop: 2,
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
  statusRow: {
    backgroundColor: '#E8F3EA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: '#6F6258',
    fontWeight: '700',
    marginBottom: 3,
  },
  statusValue: {
    fontSize: 16,
    color: '#1F5C43',
    fontWeight: '800',
  },
  verifiedCard: {
    backgroundColor: '#E8F3EA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F5C43',
  },
  verifiedTitle: {
    fontSize: 16,
    color: '#1F5C43',
    fontWeight: '800',
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 13,
    color: '#4B3426',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    color: '#4B3426',
    fontWeight: '800',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    color: '#4B3426',
    fontWeight: '800',
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7CEC2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#3D2B22',
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1F5C43',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1F5C43',
    fontSize: 13,
    fontWeight: '800',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1F5C43',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
