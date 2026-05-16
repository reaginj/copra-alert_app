import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ProfileInfoItem = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type ProfileInfoCardProps = {
  name: string;
  email: string;
  avatarIcon?: keyof typeof Ionicons.glyphMap;
  items: ProfileInfoItem[];
};

export default function ProfileInfoCard({
  name,
  email,
  avatarIcon = 'person',
  items,
}: ProfileInfoCardProps) {
  return (
    <>
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <Ionicons name={avatarIcon} size={46} color="#FFFFFF" />
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.infoCard}>
        {items.map((item) => (
          <InfoRow
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </View>
    </>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: ProfileInfoItem) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={22} color="#1F5C43" />
      </View>

      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileTop: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 20,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#1F5C43',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3D2B22',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#7C7C72',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F3EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8B837A',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3D2B22',
  },
});
