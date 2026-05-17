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
              name="leaf-outline"
              size={26}
              color={selectedRole === 'farmer' ? '#FFFFFF' : '#1E8A3A'}
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
              color={selectedRole === 'warehouse' ? '#FFFFFF' : '#1E8A3A'}
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
    color: '#4A3728',
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
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#FFFCF8',
  },
  activeRole: {
    borderColor: '#1E8A3A',
    backgroundColor: '#E8F3EA',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5E8',
    borderWidth: 1,
    borderColor: '#CFE5C9',
  },
  activeIconBox: {
    backgroundColor: '#1E8A3A',
    borderColor: '#1E8A3A',
  },
  roleTitle: {
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
    color: '#4A3728',
  },
  roleDesc: {
    fontSize: 12,
    color: '#74665A',
    textAlign: 'center',
    marginTop: 4,
  },
});
