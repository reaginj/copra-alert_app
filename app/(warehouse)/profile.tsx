import { router } from 'expo-router';
import ProfilePopup from '@/components/copra/ProfilePopup';

export default function WarehouseProfile() {
  const close = () => router.canGoBack() ? router.back() : router.replace('/(warehouse)/warehouse' as never);
  return <ProfilePopup visible role="warehouse" onClose={close} />;
}
