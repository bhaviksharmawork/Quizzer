import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TabBarIconProps {
  color: string;
  size: number;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: TabBarIconProps) => <IconSymbol size={size} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }: TabBarIconProps) => <IconSymbol size={size} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="room"
        options={{
          title: 'Room',
          tabBarIcon: ({ color, size }: TabBarIconProps) => <IconSymbol size={size} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, size }: TabBarIconProps) => <IconSymbol size={size} name="questionmark.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: 'Result',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'trophy' : 'trophy'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addquiz"
        options={{
          title: 'Add Quiz',
          href: '/addquiz',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol name={focused ? 'plus.circle' : 'plus.circle'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
