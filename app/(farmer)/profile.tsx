import { router } from 'expo-router';
import ProfilePopup from '@/components/copra/ProfilePopup';

export default function FarmerProfile() {
  const close = () => router.canGoBack() ? router.back() : router.replace('/(farmer)/dashboard_farmer' as never);
  return <ProfilePopup visible role="farmer" onClose={close} />;
}
