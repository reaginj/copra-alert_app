import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';





export default function TabLayout() {
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#246B45',
        tabBarInactiveTintColor: '#7D867F',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF', paddingTop: 5, height: 66, borderTopColor: '#E3E4DA',
        },
      }}>
      <Tabs.Screen
        name="dashboard_farmer"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="monitor"
        options={{
          title: 'Monitoring',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="thermometer.medium" color={color as string} />,
        }}
        
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Batches',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="briefcase.fill" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="supply"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="truck.box.fill" color={color as string} />,
        }}
      />  
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
