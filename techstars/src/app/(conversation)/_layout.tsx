import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import type { ComponentProps } from 'react';

import { APP_BACKGROUND } from '@/constants/vela-colors';

type TabIconName = ComponentProps<typeof SymbolView>['name'];

function TabIcon({
  color,
  focused,
  name,
}: {
  color: string;
  focused: boolean;
  name: TabIconName;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <SymbolView
        name={name}
        size={20}
        weight="semibold"
        tintColor={color}
      />
    </View>
  );
}

export default function ConversationLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: APP_BACKGROUND },
          tabBarActiveTintColor: '#F8EBD7',
          tabBarInactiveTintColor: 'rgba(197,193,245,0.58)',
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                focused={focused}
                name={{
                  ios: 'house.fill',
                  android: 'home',
                  web: 'home',
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="voice"
          options={{
            title: 'Voice',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                focused={focused}
                name={{
                  ios: 'waveform',
                  android: 'graphic_eq',
                  web: 'graphic_eq',
                }}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: Platform.select({ ios: 18, android: 14, default: 14 }),
    height: Platform.select({ ios: 82, default: 72 }),
    backgroundColor: 'rgba(12,12,20,0.96)',
    borderTopWidth: 0,
    borderRadius: 28,
    paddingBottom: Platform.select({ ios: 14, default: 10 }),
    paddingTop: 8,
    elevation: 0,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(248,235,215,0.12)',
  },
});
