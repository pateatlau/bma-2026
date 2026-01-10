import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
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

interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function MobileDrawer({ visible, onClose }: MobileDrawerProps) {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (path: string) => pathname === path.replace('/(app)', '');

  const handleNavigation = (path: string) => {
    router.push(path as any);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.drawer,
            { paddingTop: insets.top + spacing.lg, backgroundColor: colors.surface },
          ]}
        >
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.brandName, { color: colors.text }]}>BMA 2026</Text>
              <Text style={[styles.userName, { color: colors.textSecondary }]}>
                {user?.name}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.navItems}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={[styles.navItem, isActive(item.path) && styles.navItemActive]}
                onPress={() => handleNavigation(item.path)}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isActive(item.path) ? colors.primary : colors.textSecondary}
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
                {isActive(item.path) && (
                  <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <View
                style={[
                  styles.themeIconContainer,
                  { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(99, 102, 241, 0.1)' },
                ]}
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={22}
                  color={isDark ? '#FBBF24' : '#6366F1'}
                />
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Text>
              <View
                style={[
                  styles.themeSwitchTrack,
                  { backgroundColor: isDark ? colors.primary : colors.border },
                ]}
              >
                <View
                  style={[
                    styles.themeSwitchThumb,
                    isDark ? styles.themeSwitchThumbActive : null,
                  ]}
                />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  brandName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  closeButton: {
    padding: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  navItems: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  navItemActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  navLabel: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.md,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  footer: {
    marginTop: 'auto',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeLabel: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.md,
  },
  themeSwitchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  themeSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  themeSwitchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  logoutText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.md,
  },
});
