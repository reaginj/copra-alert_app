import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/config/firebase';
import { palette } from './ScopeUI';
import SettingRow from './SettingRow';

type ProfileRole = 'farmer' | 'warehouse';
type Props = { visible: boolean; role: ProfileRole; onClose: () => void };

export default function ProfilePopup({ visible, role, onClose }: Props) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('No logged-in user found.');
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        const profile = snapshot.exists() ? snapshot.data() : undefined;
        if (active) setUsername(profile?.username?.trim() || profile?.displayName?.trim() || user.displayName?.trim() || 'Username unavailable');
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load account settings.');
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [role, visible]);

  const resetPasswordForm = () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); };
  const closePassword = () => { if (savingPassword) return; setPasswordOpen(false); resetPasswordForm(); };
  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return Alert.alert('Check password', 'Complete all password fields.');
    if (newPassword.length < 6) return Alert.alert('Check password', 'The new password must contain at least 6 characters.');
    if (newPassword !== confirmPassword) return Alert.alert('Check password', 'The new password and confirmation do not match.');
    const user = auth.currentUser;
    if (!user?.email) return Alert.alert('Unable to change password', 'The authenticated account does not have an email address.');
    try {
      setSavingPassword(true);
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
      await updatePassword(user, newPassword);
      setPasswordOpen(false); resetPasswordForm();
      Alert.alert('Password changed', 'Your password was updated successfully.');
    } catch (cause: any) {
      const message = cause?.code === 'auth/invalid-credential' || cause?.code === 'auth/wrong-password' ? 'The current password is incorrect.' : cause?.code === 'auth/requires-recent-login' ? 'Please log in again before changing your password.' : cause?.message || 'Unable to change the password. Please try again.';
      Alert.alert('Unable to change password', message);
    } finally { setSavingPassword(false); }
  };

  const confirmLogout = () => Alert.alert('Log Out?', 'Are you sure you want to log out of your Copra-Alert account?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', style: 'destructive', onPress: async () => {
      try { await signOut(auth); onClose(); router.dismissAll(); router.replace('/'); }
      catch (cause) { Alert.alert('Unable to log out', cause instanceof Error ? cause.message : 'Please try again.'); }
    } },
  ]);

  return <>
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} /><View style={styles.sheet}>
        <View style={styles.header}><View><Text style={styles.title}>Profile & Settings</Text><Text style={styles.subtitle}>Account information and security</Text></View><TouchableOpacity style={styles.close} onPress={onClose}><Ionicons name="close" size={21} color={palette.ink} /></TouchableOpacity></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? <View style={styles.state}><ActivityIndicator color={palette.green} /><Text style={styles.stateText}>Loading account…</Text></View> : error ? <Text style={styles.error}>{error}</Text> : <View style={styles.accountCard}><View style={styles.avatar}><Ionicons name={role === 'farmer' ? 'leaf-outline' : 'business-outline'} size={25} color={palette.green} /></View><View style={styles.accountCopy}><Text style={styles.fieldLabel}>Username</Text><Text style={styles.username}>{username}</Text><Text style={styles.role}>Role: {role === 'farmer' ? 'Farmer' : 'Warehouse'}</Text></View></View>}
          <View style={styles.settings}><SettingRow icon="lock-closed-outline" label="Change Password" onPress={() => setPasswordOpen(true)} /><SettingRow icon="log-out-outline" label="Log Out" onPress={confirmLogout} /></View>
        </ScrollView>
      </View></SafeAreaView>
    </Modal>
    <Modal visible={passwordOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={closePassword}>
      <KeyboardAvoidingView style={styles.passwordOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><Pressable style={StyleSheet.absoluteFill} onPress={closePassword} /><View style={styles.passwordCard}>
        <Text style={styles.passwordTitle}>Change Password</Text><Text style={styles.passwordHelp}>Confirm your current password before choosing a new one.</Text>
        <PasswordField label="Current password" value={currentPassword} onChangeText={setCurrentPassword} /><PasswordField label="New password" value={newPassword} onChangeText={setNewPassword} /><PasswordField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} />
        <View style={styles.actions}><TouchableOpacity style={styles.cancel} disabled={savingPassword} onPress={closePassword}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={[styles.save, savingPassword && styles.disabled]} disabled={savingPassword} onPress={changePassword}><Text style={styles.saveText}>{savingPassword ? 'Updating…' : 'Update Password'}</Text></TouchableOpacity></View>
      </View></KeyboardAvoidingView>
    </Modal>
  </>;
}

function PasswordField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View style={styles.field}><Text style={styles.inputLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#13251BA6' }, sheet: { maxHeight: '86%', backgroundColor: '#F7EFE3', borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 18, borderBottomWidth: 1, borderBottomColor: '#E8DDCF' }, title: { color: palette.ink, fontSize: 21, fontWeight: '800' }, subtitle: { color: palette.muted, fontSize: 12, marginTop: 3 }, close: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white }, content: { padding: 18, paddingBottom: 28, gap: 14 }, state: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 16, backgroundColor: palette.white, borderRadius: 16 }, stateText: { color: palette.muted, fontWeight: '700' }, error: { color: palette.danger, padding: 14, backgroundColor: '#FBEAE8', borderRadius: 14 }, accountCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.line }, avatar: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paleGreen }, accountCopy: { flex: 1 }, fieldLabel: { color: palette.muted, fontSize: 11, fontWeight: '700' }, username: { color: palette.ink, fontSize: 17, fontWeight: '800', marginTop: 2 }, role: { color: palette.green, fontSize: 12, fontWeight: '700', marginTop: 4 }, settings: { padding: 5, backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.line }, passwordOverlay: { flex: 1, justifyContent: 'center', padding: 18, backgroundColor: '#13251BA6' }, passwordCard: { backgroundColor: palette.white, borderRadius: 20, padding: 18 }, passwordTitle: { color: palette.ink, fontSize: 20, fontWeight: '800' }, passwordHelp: { color: palette.muted, fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 15 }, field: { marginBottom: 11 }, inputLabel: { color: palette.ink, fontSize: 12, fontWeight: '700', marginBottom: 6 }, input: { minHeight: 48, borderWidth: 1, borderColor: '#CDD2CB', borderRadius: 11, paddingHorizontal: 12, color: palette.ink, backgroundColor: palette.white }, actions: { flexDirection: 'row', gap: 9, marginTop: 6 }, cancel: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.green, borderRadius: 11 }, cancelText: { color: palette.green, fontWeight: '800' }, save: { flex: 1.4, minHeight: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.green, borderRadius: 11 }, saveText: { color: palette.white, fontWeight: '800' }, disabled: { opacity: 0.55 },
});
