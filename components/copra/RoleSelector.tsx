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
          <Text style={styles.roleIcon}>ðŸ‘¨â€ðŸŒ¾</Text>
          <Text style={styles.roleTitle}>Farmer</Text>
          <Text style={styles.roleDesc}>Manage farm products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBox, selectedRole === 'warehouse' && styles.activeRole]}
          onPress={() => onRoleChange('warehouse')}
        >
          <Text style={styles.roleIcon}>ðŸ¬</Text>
          <Text style={styles.roleTitle}>Warehouse</Text>
          <Text style={styles.roleDesc}>Manage inventory and distribution</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  activeRole: {
    borderColor: '#137A32',
    backgroundColor: '#EAF6ED',
  },
  roleIcon: {
    fontSize: 34,
  },
  roleTitle: {
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  roleDesc: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
  },
});
