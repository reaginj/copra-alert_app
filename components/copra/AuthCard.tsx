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
  onForgotPassword: () => void;
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
  onForgotPassword,
  onModeChange,
}: AuthCardProps) {
  const isRegisterMode = mode === 'register';

  return (
    <View style={styles.card}>
      <Text style={styles.welcome}>
        {isRegisterMode ? 'Register' : 'Welcome Back!'}
      </Text>
      <Text style={styles.smallText}>
        {isRegisterMode ? 'Register with basic credentials' : 'Login to continue'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9A8D80"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9A8D80"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        returnKeyType="done"
      />

      {!isRegisterMode && (
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={onForgotPassword}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      )}

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
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    padding: 20,
    paddingTop: 24,
    elevation: 9,
    borderWidth: 1,
    borderColor: '#E1D1BA',
    shadowColor: '#4A3728',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#2E4F2F',
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
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    color: '#3E2A1E',
    backgroundColor: '#FFFFFF',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 6,
    paddingVertical: 4,
  },
  forgotText: {
    color: '#277C3E',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#277C3E',
    padding: 16,
    borderRadius: 10,
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
    borderColor: '#6B432C',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#F6EFE4',
  },
  switchButtonText: {
    color: '#3E2A1E',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
});
