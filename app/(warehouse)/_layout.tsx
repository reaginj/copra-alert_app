import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WarehouseLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#246B45', tabBarInactiveTintColor: '#7D867F', tabBarStyle: { height: 66, paddingTop: 5, backgroundColor: '#FFFFFF', borderTopColor: '#E3E4DA' } }}>
      <Tabs.Screen name="warehouse" options={{ title: 'Dashboard', tabBarIcon: ({color,size}) => <Ionicons name="grid-outline" color={color as string} size={size}/> }} />
      <Tabs.Screen name="deliveries" options={{ title: 'Deliveries', tabBarIcon: ({color,size}) => <Ionicons name="cube-outline" color={color as string} size={size}/> }} />
      <Tabs.Screen name="records" options={{ title: 'Records', tabBarIcon: ({color,size}) => <Ionicons name="document-text-outline" color={color as string} size={size}/> }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
