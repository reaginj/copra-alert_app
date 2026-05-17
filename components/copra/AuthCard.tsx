import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import RoleSelector, { AuthRole } from '@/components/copra/RoleSelector';

type AuthCardProps = {
  mode: 'login' | 'register';
  email: string;
  password: string;
  selectedRole: AuthRole;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (role: AuthRole) => void;
  onLogin: () => void;
  onRegister: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
};

export default function AuthCard({
  mode,
  email,
  password,
  selectedRole,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onLogin,
  onRegister,
  onModeChange,
}: AuthCardProps) {
  const isRegisterMode = mode === 'register';

  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />

      <Text style={styles.welcome}>
        {isRegisterMode ? 'Register' : 'Welcome Back!'}
      </Text>
      <Text style={styles.smallText}>
        {isRegisterMode ? 'Register with basic credentials' : 'Login to continue'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="example@email.com"
        placeholderTextColor="#9A8D80"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#9A8D80"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        returnKeyType="done"
      />

      <RoleSelector
        selectedRole={selectedRole}
        onRoleChange={onRoleChange}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={isRegisterMode ? onRegister : onLogin}
      >
        <Text style={styles.primaryText}>
          {isRegisterMode ? 'REGISTER' : 'LOGIN'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => onModeChange(isRegisterMode ? 'login' : 'register')}
      >
        <Text style={styles.switchButtonText}>
          {isRegisterMode ? 'Already have an account? Login' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    paddingTop: 26,
    elevation: 7,
    borderWidth: 1,
    borderColor: '#E2D2BD',
    overflow: 'hidden',
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: '#4A3728',
  },
  welcome: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#4A3728',
  },
  smallText: {
    textAlign: 'center',
    color: '#74665A',
    marginBottom: 20,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7CEC2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    color: '#4A3728',
    backgroundColor: '#FFFCF8',
  },
  primaryButton: {
    backgroundColor: '#1E8A3A',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
  switchButton: {
    borderWidth: 1,
    borderColor: '#4A3728',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: '#F8F0E3',
  },
  switchButtonText: {
    color: '#4A3728',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
});
