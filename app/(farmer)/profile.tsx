import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

import Header from '@/components/copra/Header';
import ProfileInfoCard from '@/components/copra/ProfileInfoCard';
import SettingRow from '@/components/copra/SettingRow';
import { auth, db } from '@/config/firebase';

type OwnerVerificationStatus = 'not_requested' | 'pending' | 'approved' | 'rejected';

type FarmerProfileData = {
  displayName: string;
  email: string;
  contactNumber: string;
  location: string;
  farmName: string;
  farmLocation: string;
  ownerVerificationStatus: OwnerVerificationStatus;
  isVerifiedOwner: boolean;
};

export default function FarmerProfile() {
  const [profile, setProfile] = useState<FarmerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
          location: data.location || '',
          farmName: data.farmName || '',
          farmLocation: data.farmLocation || '',
          ownerVerificationStatus: data.ownerVerificationStatus || 'not_requested',
          isVerifiedOwner: Boolean(data.isVerifiedOwner),
        });
      } catch (error: any) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const getVerificationLabel = (status: OwnerVerificationStatus, isVerifiedOwner: boolean) => {
    if (status === 'approved' && isVerifiedOwner) {
      return 'Verified Farm Owner';
    }

    if (status === 'pending') {
      return 'Pending Verification';
    }

    if (status === 'rejected') {
      return 'Rejected';
    }

    return 'Not Requested';
  };

  const isVerifiedFarmOwner =
    profile?.ownerVerificationStatus === 'approved' && profile.isVerifiedOwner === true;

  const showPlaceholder = (label: string) => {
    Alert.alert(label, 'This setting will be available soon.');
  };

  const handleRequestOwnerVerification = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Farm Owner Verification', 'No logged-in user found.');
        return;
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ownerVerificationStatus: 'pending',
        isVerifiedOwner: false,
        updatedAt: serverTimestamp(),
      });

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              ownerVerificationStatus: 'pending',
              isVerifiedOwner: false,
            }
          : currentProfile
      );

      Alert.alert('Farm Owner Verification', 'Farm owner verification request submitted.');
    } catch (error: any) {
      Alert.alert('Farm Owner Verification', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Farmer Profile"
          subtitle="Manage farmer account and settings"
          profileRoute="/(farmer)/profile"
        />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                { label: 'Location', value: profile.location || 'Not set', icon: 'location-outline' },
                { label: 'Farm Name', value: profile.farmName || 'Not set', icon: 'home-outline' },
                { label: 'Farm Location', value: profile.farmLocation || 'Not set', icon: 'map-outline' },
                {
                  label: isVerifiedFarmOwner ? 'Owner Status' : 'Owner Verification',
                  value: getVerificationLabel(
                    profile.ownerVerificationStatus,
                    profile.isVerifiedOwner
                  ),
                  icon: 'shield-checkmark-outline',
                },
              ]}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer Settings</Text>

              <SettingRow
                icon="create-outline"
                label="Edit Farmer Profile"
                onPress={() => showPlaceholder('Edit Farmer Profile')}
              />
              <SettingRow
                icon="notifications-outline"
                label="Notification Settings"
                onPress={() => showPlaceholder('Notification Settings')}
              />
              <SettingRow
                icon="lock-closed-outline"
                label="Change Password"
                onPress={() => showPlaceholder('Change Password')}
              />
              <SettingRow
                icon="home-outline"
                label="Back to Farmer Dashboard"
                onPress={() => router.replace('/(farmer)/dashboard_farmer' as any)}
              />
              <SettingRow
                icon="log-out-outline"
                label="Logout"
                onPress={handleLogout}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farm Owner Verification</Text>

              {isVerifiedFarmOwner ? (
                <View style={styles.verifiedCard}>
                  <Text style={styles.verifiedTitle}>Verified Farm Owner</Text>
                  <Text style={styles.verifiedText}>
                    Your farmer account is verified for owner-level farm records.
                  </Text>
                </View>
              ) : null}

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <Text style={styles.statusValue}>
                  {getVerificationLabel(
                    profile.ownerVerificationStatus,
                    profile.isVerifiedOwner
                  )}
                </Text>
              </View>

              {profile.ownerVerificationStatus === 'not_requested' ||
              profile.ownerVerificationStatus === 'rejected' ? (
                <SettingRow
                  icon="shield-checkmark-outline"
                  label={
                    profile.ownerVerificationStatus === 'rejected'
                      ? 'Request Again'
                      : 'Request Farm Owner Verification'
                  }
                  onPress={handleRequestOwnerVerification}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7EFE3',
  },
  topSafeArea: {
    backgroundColor: '#4A3728',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 30,
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
});
