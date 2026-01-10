import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';

const NAV_ITEMS = [
  { label: 'Home', path: '/(app)/home', icon: 'home-outline' as const },
  { label: 'Profile', path: '/(app)/profile', icon: 'person-outline' as const },
];

export function WebHeader() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (path: string) => pathname === path.replace('/(app)', '');

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push('/(app)/home')}
        >
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>BMA 2026</Text>
        </TouchableOpacity>

        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.path}
              style={({ hovered }) => [
                styles.navItem,
                isActive(item.path) && styles.navItemActive,
                hovered && !isActive(item.path) && { backgroundColor: colors.surfaceElevated },
              ]}
              onPress={() => router.push(item.path as any)}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={isActive(item.path) ? colors.primary : colors.textSecondary}
                style={styles.navIcon}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: colors.textSecondary },
                  isActive(item.path) && { color: colors.primary },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.userSection}>
          <Pressable
            style={({ hovered }) => [
              styles.themeToggle,
              hovered && { backgroundColor: colors.surfaceElevated },
            ]}
            onPress={toggleTheme}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          <Text style={[styles.userName, { color: colors.textSecondary }]}>{user?.name}</Text>

          <Pressable
            style={({ hovered }) => [
              styles.logoutButton,
              hovered && { backgroundColor: colors.surfaceElevated },
            ]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.logoutText, { color: colors.textSecondary }]}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    height: 64,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  brandName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  nav: {
    flexDirection: 'row',
    marginLeft: spacing.xxl,
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  navItemActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  navIcon: {
    marginRight: spacing.xs,
  },
  navLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: spacing.md,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  logoutText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
  },
});
