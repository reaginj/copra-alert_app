import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Header from '@/components/copra/Header';
import ProfileInfoCard from '@/components/copra/ProfileInfoCard';
import SettingRow from '@/components/copra/SettingRow';
import { auth, db } from '@/config/firebase';

type WarehouseProfileData = {
  displayName: string;
  email: string;
  contactNumber: string;
  location: string;
  warehouseName: string;
  warehouseLocation: string;
};

export default function WarehouseProfile() {
  const [profile, setProfile] = useState<WarehouseProfileData | null>(null);
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
          displayName: data.displayName || 'Warehouse User',
          email: data.email || user.email || '',
          contactNumber: data.contactNumber || '',
          location: data.location || '',
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

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <Header
          title="Warehouse Profile"
          subtitle="Manage warehouse account and settings"
          profileRoute="/(warehouse)/profile"
        />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              { label: 'Location', value: profile.location || 'Not set', icon: 'location-outline' },
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
            label="Back to Warehouse Dashboard"
            onPress={() => router.replace('/(warehouse)/warehouse' as any)}
          />
          <SettingRow
            icon="log-out-outline"
            label="Logout"
            onPress={handleLogout}
          />
        </View>
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
    marginBottom: 20,
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
