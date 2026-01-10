import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Card,
  Button,
  ScreenContainer,
  Text,
  Heading,
  Spacer,
  Stack,
  Row,
  Avatar,
  Divider,
} from '@/components';
import { spacing, borderRadius } from '@/constants/theme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { iconSizes, maxWidth } from '@/constants/tokens';
import { withOpacity } from '@/utils/colors';

const MENU_ITEMS = [
  {
    icon: 'person-outline' as const,
    label: 'Edit Profile',
    description: 'Update your personal information',
  },
  {
    icon: 'notifications-outline' as const,
    label: 'Notifications',
    description: 'Manage your notification preferences',
  },
  {
    icon: 'shield-outline' as const,
    label: 'Privacy',
    description: 'Control your privacy settings',
  },
  {
    icon: 'color-palette-outline' as const,
    label: 'Appearance',
    description: 'Customize the app look and feel',
  },
  {
    icon: 'help-circle-outline' as const,
    label: 'Help & Support',
    description: 'Get help or contact support',
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { isWideScreen } = useMediaQuery();

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('') ||
    user?.email?.[0]?.toUpperCase() ||
    '?';

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      safeAreaBottom
      contentStyle={{
        paddingTop: spacing.xl,
      }}
    >
      <View
        style={[
          styles.innerContent,
          isWideScreen && { maxWidth: maxWidth.sm, alignSelf: 'center' as const },
        ]}
      >
        {/* Profile Card */}
        <Card variant="elevated" padding="lg">
          <Stack gap="md" style={{ alignItems: 'center' }}>
            <View style={styles.avatarContainer}>
              <Avatar name={initials} size="xl" style={styles.avatar} />
              <View
                style={[
                  styles.avatarBadge,
                  { borderColor: colors.surface, backgroundColor: colors.success },
                ]}
              >
                <Ionicons name="checkmark" size={iconSizes.xs} color={colors.textOnPrimary} />
              </View>
            </View>

            <Heading level="h2">{user?.name}</Heading>
            <Text color="secondary">{user?.email}</Text>

            <Divider style={{ width: '100%', marginVertical: spacing.md }} />

            <Row justify="around" style={{ width: '100%' }}>
              <Stack gap="xs" style={{ alignItems: 'center' }}>
                <Heading level="h3">128</Heading>
                <Text variant="small" color="secondary">
                  Projects
                </Text>
              </Stack>
              <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
              <Stack gap="xs" style={{ alignItems: 'center' }}>
                <Heading level="h3">1.2k</Heading>
                <Text variant="small" color="secondary">
                  Followers
                </Text>
              </Stack>
              <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
              <Stack gap="xs" style={{ alignItems: 'center' }}>
                <Heading level="h3">847</Heading>
                <Text variant="small" color="secondary">
                  Following
                </Text>
              </Stack>
            </Row>
          </Stack>
        </Card>

        <Spacer size="xl" />

        {/* Settings Section */}
        <Stack gap="md">
          <Heading level="h3">Settings</Heading>
          <Card variant="elevated" padding="none">
            {MENU_ITEMS.map((item, index) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: withOpacity(colors.primary, 0.1) },
                    ]}
                  >
                    <Ionicons name={item.icon} size={iconSizes.md} color={colors.primary} />
                  </View>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text weight="medium">{item.label}</Text>
                    <Text variant="small" color="secondary">
                      {item.description}
                    </Text>
                  </Stack>
                  <Ionicons name="chevron-forward" size={iconSizes.md} color={colors.textMuted} />
                </TouchableOpacity>
                {index < MENU_ITEMS.length - 1 && (
                  <Divider style={{ marginLeft: spacing.md + 40 + spacing.md }} />
                )}
              </View>
            ))}
          </Card>
        </Stack>

        <Spacer size="xl" />

        {/* Danger Zone */}
        <Card
          variant="outlined"
          padding="lg"
          style={{
            borderColor: withOpacity(colors.error, 0.3),
          }}
        >
          <Stack gap="sm">
            <Text color="error" weight="semibold">
              Danger Zone
            </Text>
            <Text variant="small" color="secondary">
              Once you log out, you'll need to sign in again to access your account.
            </Text>
            <Spacer size="sm" />
            <Button
              title="Logout"
              onPress={logout}
              variant="dangerOutline"
              fullWidth
            />
          </Stack>
        </Card>

        <Spacer size="lg" />

        {/* Footer */}
        <Stack gap="sm" style={{ alignItems: 'center' }}>
          <Text variant="small" color="muted">
            BMA 2026 v1.0.0
          </Text>
        </Stack>

        <Spacer size="xl" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  innerContent: {
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
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
  statDivider: {
    width: 1,
    height: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
