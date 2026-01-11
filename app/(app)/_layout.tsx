import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { WebHeader, MobileHeader, MobileDrawer } from '@/components/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppLayout() {
  const { useHorizontalNav } = useMediaQuery();
  const { colors } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {useHorizontalNav ? (
        <WebHeader />
      ) : (
        <>
          <MobileHeader onMenuPress={() => setDrawerVisible(true)} />
          <MobileDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
        </>
      )}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
