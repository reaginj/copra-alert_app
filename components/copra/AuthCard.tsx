import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AuthCardProps = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onForgotPassword: () => void;
  loading?: boolean;
  error?: string;
};

export default function AuthCard({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onForgotPassword,
  loading = false,
  error,
}: AuthCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.card}>
      <Text style={styles.welcome}>Welcome Back!</Text>
      <Text style={styles.smallText}>Login to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or username"
        placeholderTextColor="#9A8D80"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
      />

      <View style={styles.passwordRow}>
        <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor="#9A8D80" value={password} onChangeText={onPasswordChange} secureTextEntry={!showPassword} returnKeyType="done" onSubmitEditing={onLogin} />
        <TouchableOpacity accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color="#5D685F" />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.forgotButton}
        onPress={onForgotPassword}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>LOGIN</Text>}
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
  passwordRow: { borderWidth: 1, borderColor: '#D7CEC2', borderRadius: 10, marginBottom: 10, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: '#3E2A1E' },
  eyeButton: { padding: 13 },
  error: { color: '#A13D35', fontSize: 12, marginBottom: 4 },
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
});
