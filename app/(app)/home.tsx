import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, ScreenContainer, Text, Heading, Spacer, Stack, Row, Divider } from '@/components';
import { spacing, borderRadius } from '@/constants/theme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { iconSizes, maxWidth } from '@/constants/tokens';
import { withOpacity } from '@/utils/colors';

const QUICK_ACTIONS = [
  { icon: 'stats-chart-outline' as const, label: 'Analytics', colorKey: 'primary' as const },
  { icon: 'people-outline' as const, label: 'Team', colorKey: 'accentBlue' as const },
  { icon: 'settings-outline' as const, label: 'Settings', colorKey: 'accentPurple' as const },
  { icon: 'help-circle-outline' as const, label: 'Help', colorKey: 'accentGreen' as const },
];

const RECENT_ACTIVITY = [
  { id: '1', title: 'Project Update', description: 'New milestone reached', time: '2h ago' },
  { id: '2', title: 'Team Meeting', description: 'Scheduled for tomorrow', time: '4h ago' },
  { id: '3', title: 'Report Generated', description: 'Q4 performance report', time: '1d ago' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { isWideScreen } = useMediaQuery();

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
          isWideScreen && { maxWidth: maxWidth.lg, alignSelf: 'center' as const },
        ]}
      >
        {/* Welcome Section */}
        <Stack gap="sm">
          <Text variant="large" color="secondary">
            Welcome back,
          </Text>
          <Heading level="h1">{user?.name}</Heading>
          <Text color="muted">Here&apos;s what&apos;s happening today</Text>
        </Stack>

        <Spacer size="xl" />

        {/* Stats Grid */}
        <Row gap="md" style={styles.statsGrid}>
          <Card variant="elevated" style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: withOpacity(colors.primary, 0.1) },
              ]}
            >
              <Ionicons name="trending-up" size={iconSizes.lg} color={colors.primary} />
            </View>
            <Heading level="h2" style={styles.statValue}>
              2,847
            </Heading>
            <Text variant="small" color="secondary">
              Total Views
            </Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: withOpacity(colors.accentBlue, 0.1) },
              ]}
            >
              <Ionicons name="checkmark-done" size={iconSizes.lg} color={colors.accentBlue} />
            </View>
            <Heading level="h2" style={styles.statValue}>
              89%
            </Heading>
            <Text variant="small" color="secondary">
              Completion
            </Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: withOpacity(colors.accentGreen, 0.1) },
              ]}
            >
              <Ionicons name="flash" size={iconSizes.lg} color={colors.accentGreen} />
            </View>
            <Heading level="h2" style={styles.statValue}>
              24
            </Heading>
            <Text variant="small" color="secondary">
              Active Tasks
            </Text>
          </Card>
        </Row>

        <Spacer size="xl" />

        {/* Quick Actions */}
        <Stack gap="md">
          <Heading level="h3">Quick Actions</Heading>
          <Row justify="between">
            {QUICK_ACTIONS.map((action, index) => {
              const actionColor = colors[action.colorKey];
              return (
                <Stack key={index} gap="sm" style={{ alignItems: 'center' }}>
                  <View
                    style={[styles.actionIcon, { backgroundColor: withOpacity(actionColor, 0.1) }]}
                  >
                    <Ionicons name={action.icon} size={iconSizes.lg} color={actionColor} />
                  </View>
                  <Text variant="small" color="secondary">
                    {action.label}
                  </Text>
                </Stack>
              );
            })}
          </Row>
        </Stack>

        <Spacer size="xl" />

        {/* Recent Activity */}
        <Stack gap="md">
          <Heading level="h3">Recent Activity</Heading>
          <Card variant="elevated" padding="none">
            {RECENT_ACTIVITY.map((activity, index) => (
              <View key={activity.id}>
                <Row align="center" gap="md" style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text weight="medium">{activity.title}</Text>
                    <Text variant="small" color="secondary">
                      {activity.description}
                    </Text>
                  </Stack>
                  <Text variant="small" color="muted">
                    {activity.time}
                  </Text>
                </Row>
                {index < RECENT_ACTIVITY.length - 1 && (
                  <Divider style={{ marginHorizontal: spacing.md }} />
                )}
              </View>
            ))}
          </Card>
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
  statsGrid: {
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    minWidth: 100,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    marginBottom: spacing.xs,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityItem: {
    padding: spacing.md,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
