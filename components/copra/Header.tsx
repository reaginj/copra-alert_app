import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ProfilePopup from '@/components/copra/ProfilePopup';

type HeaderProps = {
  title: string;
  subtitle?: string;
  profileRoute?: string;
};

export default function Header({
  title,
  subtitle,
  profileRoute,
}: HeaderProps) {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const profileRole = profileRoute?.includes('warehouse') ? 'warehouse' : 'farmer';

  const handleProfilePress = () => {
    if (profileRoute) {
      setIsProfileVisible(true);
    }
  };

  return (
    <>
      <View style={[styles.container, profileRole === 'farmer' && styles.farmerContainer]}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, profileRole === 'farmer' && styles.farmerTitle]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, profileRole === 'farmer' && styles.farmerSubtitle]}>{subtitle}</Text> : null}
        </View>

        {profileRoute ? (
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            <Ionicons name="person-circle-outline" size={34} color="#F6F1B9" />
          </TouchableOpacity>
        ) : null}
      </View>

      {profileRoute ? (
        <ProfilePopup
          visible={isProfileVisible}
          role={profileRole}
          onClose={() => setIsProfileVisible(false)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#174B32',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmerContainer: {
    paddingTop: 13,
    paddingBottom: 13,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  farmerTitle: {
    fontSize: 22,
  },

  subtitle: {
    fontSize: 14,
    color: '#DDEADD',
    textAlign: 'left',
    paddingTop: 3,
  },
  farmerSubtitle: {
    fontSize: 13,
  },

  profileButton: {
    paddingLeft: 12,
    paddingVertical: 6,
  },
});
