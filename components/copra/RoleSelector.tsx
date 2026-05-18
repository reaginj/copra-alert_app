import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type AuthRole = 'farmer' | 'warehouse';

type RoleSelectorProps = {
  selectedRole: AuthRole;
  onRoleChange: (role: AuthRole) => void;
};

export default function RoleSelector({
  selectedRole,
  onRoleChange,
}: RoleSelectorProps) {
  return (
    <>
      <Text style={styles.label}>Account role</Text>

      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBox, selectedRole === 'farmer' && styles.activeRole]}
          onPress={() => onRoleChange('farmer')}
        >
          <View style={[styles.iconBox, selectedRole === 'farmer' && styles.activeIconBox]}>
            <Ionicons
              name="person-outline"
              size={26}
              color={selectedRole === 'farmer' ? '#FFFFFF' : '#277C3E'}
            />
          </View>
          <Text style={styles.roleTitle}>Farmer</Text>
          <Text style={styles.roleDesc}>Manage farm products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBox, selectedRole === 'warehouse' && styles.activeRole]}
          onPress={() => onRoleChange('warehouse')}
        >
          <View style={[styles.iconBox, selectedRole === 'warehouse' && styles.activeIconBox]}>
            <Ionicons
              name="business-outline"
              size={26}
              color={selectedRole === 'warehouse' ? '#FFFFFF' : '#277C3E'}
            />
          </View>
          <Text style={styles.roleTitle}>Warehouse</Text>
          <Text style={styles.roleDesc}>Manage inventory and distribution</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 12,
    color: '#3E2A1E',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  roleBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D7CEC2',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeRole: {
    borderColor: '#277C3E',
    backgroundColor: '#ECF4EC',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF6EF',
    borderWidth: 1,
    borderColor: '#D3E4D5',
  },
  activeIconBox: {
    backgroundColor: '#277C3E',
    borderColor: '#277C3E',
  },
  roleTitle: {
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
    color: '#3E2A1E',
  },
  roleDesc: {
    fontSize: 12,
    color: '#74665A',
    textAlign: 'center',
    marginTop: 4,
  },
});
