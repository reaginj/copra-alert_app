import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
  const handleProfilePress = () => {
    if (profileRoute) {
      router.push(profileRoute as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {profileRoute ? (
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <Ionicons name="person-circle-outline" size={34} color="#F6F1B9" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#4A3728',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  subtitle: {
    fontSize: 14,
    color: '#F6F1B9',
    textAlign: 'left',
    paddingTop: 3,
  },

  profileButton: {
    paddingLeft: 12,
    paddingVertical: 6,
  },
});
