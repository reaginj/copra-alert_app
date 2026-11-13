import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import ProfileInfoCard from '@/components/copra/ProfileInfoCard';
import SettingRow from '@/components/copra/SettingRow';
import { auth, db } from '@/config/firebase';

type ProfileRole = 'farmer' | 'warehouse';

type UserProfile = {
  displayName: string;
  email: string;
  contactNumber: string;
  farmName: string;
  farmLocation: string;
  warehouseName: string;
  warehouseLocation: string;
};

type ProfilePopupProps = {
  visible: boolean;
  role: ProfileRole;
  onClose: () => void;
};

export default function ProfilePopup({ visible, role, onClose }: ProfilePopupProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

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
          displayName: data.displayName || (role === 'farmer' ? 'Farmer User' : 'Warehouse User'),
          email: data.email || user.email || '',
          contactNumber: data.contactNumber || '',
          farmName: data.farmName || '',
          farmLocation: data.farmLocation || '',
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
  }, [role, visible]);

  const isFarmer = role === 'farmer';

  const showPlaceholder = (label: string) => {
    Alert.alert(label, 'This setting will be available soon.');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
      router.replace('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.popupCard}>
          <TouchableOpacity style={styles.closeButton} activeOpacity={0.85} onPress={onClose}>
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
                <Text style={styles.stateText}>Loading profile...</Text>
              </View>
            ) : errorMessage ? (
              <View style={styles.stateCard}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : profile ? (
              <>
                <ProfileInfoCard
                  name={profile.displayName}
                  email={profile.email}
                  avatarIcon={isFarmer ? 'leaf-outline' : 'business-outline'}
                  items={[
                    {
                      label: 'Role',
                      value: isFarmer ? 'Farmer' : 'Warehouse',
                      icon: isFarmer ? 'leaf-outline' : 'business-outline',
                    },
                    {
                      label: 'Contact Number',
                      value: profile.contactNumber || 'Not set',
                      icon: 'call-outline',
                    },
                    ...(!isFarmer
                      ? [
                          {
                            label: 'Warehouse Name',
                            value: profile.warehouseName || 'Not set',
                            icon: 'business-outline' as const,
                          },
                          {
                            label: 'Warehouse Location',
                            value: profile.warehouseLocation || 'Not set',
                            icon: 'map-outline' as const,
                          },
                        ]
                      : []),
                  ]}
                />

                {isFarmer ? (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Farm Details</Text>

                      <InfoBlock label="Farm Name" value={profile.farmName || 'Not set'} />
                      <InfoBlock label="Farm Location" value={profile.farmLocation || 'Not set'} />
                    </View>
                  </>
                ) : null}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {isFarmer ? 'Farmer Settings' : 'Warehouse Settings'}
                  </Text>

                  <SettingRow
                    icon="create-outline"
                    label={isFarmer ? 'Edit Farmer Profile' : 'Edit Warehouse Profile'}
                    onPress={() =>
                      showPlaceholder(isFarmer ? 'Edit Farmer Profile' : 'Edit Warehouse Profile')
                    }
                  />
                  <SettingRow
                    icon="lock-closed-outline"
                    label="Change Password"
                    onPress={() => showPlaceholder('Change Password')}
                  />
                  <SettingRow icon="log-out-outline" label="Logout" onPress={handleLogout} />
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>

      </View>
    </Modal>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingTop: 72,
    paddingBottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  popupCard: {
    width: '100%',
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#F7EFE3',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B3426',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#6F6258',
    fontWeight: '700',
  },
  requestCard: {
    backgroundColor: '#F7EFE3',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  requestName: {
    fontSize: 16,
    color: '#3D2B22',
    fontWeight: '800',
    marginBottom: 4,
  },
  requestDetail: {
    fontSize: 13,
    color: '#6F6258',
    fontWeight: '700',
    marginBottom: 3,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  ownerActionButton: {
    flex: 1,
    backgroundColor: '#1F5C43',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  ownerActionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#A43A2F',
  },
  rejectButtonText: {
    color: '#A43A2F',
    fontSize: 13,
    fontWeight: '800',
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
  infoBlock: {
    backgroundColor: '#F7EFE3',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6F6258',
    fontWeight: '700',
    marginBottom: 3,
  },
  infoValue: {
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
  editorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  editorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },
  editorTitle: {
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
  editorActions: {
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
