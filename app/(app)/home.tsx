import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const QUICK_ACTIONS = [
  { icon: 'stats-chart-outline' as const, label: 'Analytics', color: '#DC2626' },
  { icon: 'people-outline' as const, label: 'Team', color: '#3B82F6' },
  { icon: 'settings-outline' as const, label: 'Settings', color: '#8B5CF6' },
  { icon: 'help-circle-outline' as const, label: 'Help', color: '#10B981' },
];

const RECENT_ACTIVITY = [
  { id: '1', title: 'Project Update', description: 'New milestone reached', time: '2h ago' },
  { id: '2', title: 'Team Meeting', description: 'Scheduled for tomorrow', time: '4h ago' },
  { id: '3', title: 'Report Generated', description: 'Q4 performance report', time: '1d ago' },
];

export default function HomeScreen() {
  const { user } = useAuth();
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
        <View style={styles.welcomeSection}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Here's what's happening today
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>2,847</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Views</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="checkmark-done" size={24} color="#3B82F6" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>89%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completion</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="flash" size={24} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Tasks</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>
                  {action.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <Card>
            {RECENT_ACTIVITY.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityItem,
                  index < RECENT_ACTIVITY.length - 1 && [
                    styles.activityItemBorder,
                    { borderBottomColor: colors.borderLight },
                  ],
                ]}
              >
                <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>
                    {activity.description}
                  </Text>
                </View>
                <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                  {activity.time}
                </Text>
              </View>
            ))}
          </Card>
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
    maxWidth: 1000,
    alignSelf: 'center',
  },
  welcomeSection: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
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
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  activityDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  activityTime: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
  },
});
