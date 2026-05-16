import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import RoleSelector, { AuthRole } from '@/components/copra/RoleSelector';

type AuthCardProps = {
  email: string;
  password: string;
  selectedRole: AuthRole;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (role: AuthRole) => void;
  onLogin: () => void;
  onRegister: () => void;
};

export default function AuthCard({
  email,
  password,
  selectedRole,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onLogin,
  onRegister,
}: AuthCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.welcome}>Welcome Back!</Text>
      <Text style={styles.smallText}>Login or create an account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        returnKeyType="done"
      />

      <RoleSelector
        selectedRole={selectedRole}
        onRoleChange={onRoleChange}
      />

      <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={onRegister}>
        <Text style={styles.registerButtonText}>REGISTER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 22,
    elevation: 5,
  },
  welcome: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  smallText: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: '#0F6B2B',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#0F6B2B',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  registerButtonText: {
    color: '#0F6B2B',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
});
