import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, Button } from '@/components';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const MENU_ITEMS = [
  { icon: 'person-outline' as const, label: 'Edit Profile', description: 'Update your personal information' },
  { icon: 'notifications-outline' as const, label: 'Notifications', description: 'Manage your notification preferences' },
  { icon: 'shield-outline' as const, label: 'Privacy', description: 'Control your privacy settings' },
  { icon: 'color-palette-outline' as const, label: 'Appearance', description: 'Customize the app look and feel' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', description: 'Get help or contact support' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isWideScreen } = useMediaQuery();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.innerContent, isWideScreen && styles.wideContent]}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map(n => n[0]).join('') || user?.email?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={[styles.avatarBadge, { borderColor: colors.surface, backgroundColor: colors.success }]}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.statsRow, { borderTopColor: colors.borderLight }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>128</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Projects</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>1.2k</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>847</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <Card style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  index < MENU_ITEMS.length - 1 && [
                    styles.menuItemBorder,
                    { borderBottomColor: colors.borderLight },
                  ],
                ]}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Card style={styles.dangerZone}>
            <Text style={[styles.dangerTitle, { color: colors.error }]}>Danger Zone</Text>
            <Text style={[styles.dangerDescription, { color: colors.textSecondary }]}>
              Once you log out, you'll need to sign in again to access your account.
            </Text>
            <Button
              title="Logout"
              onPress={logout}
              variant="outline"
              style={styles.logoutButton}
              textStyle={{ color: colors.error }}
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textMuted }]}>BMA 2026 v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  innerContent: {
    width: '100%',
  },
  wideContent: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  menuDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  dangerZone: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  dangerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  dangerDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  logoutButton: {
    borderWidth: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  version: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
  },
});
