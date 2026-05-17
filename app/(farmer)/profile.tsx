import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

import ProfileInfoCard from '@/components/copra/ProfileInfoCard';
import SettingRow from '@/components/copra/SettingRow';
import { auth, db } from '@/config/firebase';

type OwnerVerificationStatus = 'not_requested' | 'pending' | 'approved' | 'rejected';

type FarmerProfileData = {
  displayName: string;
  email: string;
  contactNumber: string;
  farmName: string;
  farmLocation: string;
  ownerVerificationStatus: OwnerVerificationStatus;
  isVerifiedOwner: boolean;
};

export default function FarmerProfile() {
  const popupScale = useRef(new Animated.Value(0.96)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<FarmerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingFarmDetails, setIsSavingFarmDetails] = useState(false);
  const [isFarmEditorVisible, setIsFarmEditorVisible] = useState(false);
  const [farmNameDraft, setFarmNameDraft] = useState('');
  const [farmLocationDraft, setFarmLocationDraft] = useState('');
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

  const openFarmEditor = () => {
    if (!profile || !isVerifiedFarmOwner) {
      Alert.alert('Farm Details', 'Only verified farm owners can edit farm details.');
      return;
    }

    setFarmNameDraft(profile.farmName);
    setFarmLocationDraft(profile.farmLocation);
    setIsFarmEditorVisible(true);
  };

  const closeFarmEditor = () => {
    if (isSavingFarmDetails) {
      return;
    }

    setIsFarmEditorVisible(false);
    setFarmNameDraft('');
    setFarmLocationDraft('');
  };

  const handleSaveFarmDetails = async () => {
    try {
      if (!auth.currentUser || !profile) {
        Alert.alert('Farm Details', 'No logged-in user found.');
        return;
      }

      if (!isVerifiedFarmOwner) {
        Alert.alert('Farm Details', 'Only verified farm owners can edit farm details.');
        return;
      }

      const nextFarmName = farmNameDraft.trim();
      const nextFarmLocation = farmLocationDraft.trim();

      setIsSavingFarmDetails(true);

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        farmName: nextFarmName,
        farmLocation: nextFarmLocation,
        updatedAt: serverTimestamp(),
      });

      setProfile({
        ...profile,
        farmName: nextFarmName,
        farmLocation: nextFarmLocation,
      });

      setIsFarmEditorVisible(false);
      Alert.alert('Farm Details', 'Farm details updated successfully.');
    } catch (error: any) {
      Alert.alert('Farm Details', error.message || 'Unable to update farm details.');
    } finally {
      setIsSavingFarmDetails(false);
    }
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
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Farm Details</Text>

                {isVerifiedFarmOwner ? (
                  <TouchableOpacity
                    style={styles.editFarmButton}
                    activeOpacity={0.85}
                    onPress={openFarmEditor}
                  >
                    <Text style={styles.editFarmButtonText}>Edit Farm Details</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.farmDetailRow}>
                <Text style={styles.farmDetailLabel}>Farm Name</Text>
                <Text style={styles.farmDetailValue}>{profile.farmName || 'Not set'}</Text>
              </View>

              <View style={styles.farmDetailRow}>
                <Text style={styles.farmDetailLabel}>Farm Location</Text>
                <Text style={styles.farmDetailValue}>{profile.farmLocation || 'Not set'}</Text>
              </View>

              {!isVerifiedFarmOwner ? (
                <Text style={styles.farmEditNote}>
                  Only verified farm owners can edit farm details.
                </Text>
              ) : null}
            </View>

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
        </Animated.View>
      </SafeAreaView>

      <Modal
        visible={isFarmEditorVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFarmEditor}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Farm Details</Text>

            <Text style={styles.inputLabel}>Farm Name</Text>
            <TextInput
              style={styles.input}
              value={farmNameDraft}
              onChangeText={setFarmNameDraft}
              placeholder="Enter farm name"
              placeholderTextColor="#8B837A"
            />

            <Text style={styles.inputLabel}>Farm Location</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={farmLocationDraft}
              onChangeText={setFarmLocationDraft}
              placeholder="Enter farm location"
              placeholderTextColor="#8B837A"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.85}
                onPress={closeFarmEditor}
                disabled={isSavingFarmDetails}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                activeOpacity={0.85}
                onPress={handleSaveFarmDetails}
                disabled={isSavingFarmDetails}
              >
                <Text style={styles.saveButtonText}>
                  {isSavingFarmDetails ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
