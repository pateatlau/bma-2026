/**
 * Avatar Component
 *
 * Displays user avatars with image support, initials fallback,
 * and optional status badges.
 */

import React, { useMemo } from 'react';
import {
  View,
  Image,
  Text as RNText,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { fontWeights } from '@/constants/tokens';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  /** Image source */
  source?: ImageSourcePropType;
  /** Name for initials fallback */
  name?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Use circular shape (default) or rounded square */
  rounded?: boolean;
  /** Status indicator */
  status?: AvatarStatus;
  /** Additional styles for container */
  style?: ViewStyle;
}

/**
 * Avatar size configurations
 */
const sizeConfig: Record<AvatarSize, { diameter: number; fontSize: number; statusSize: number }> = {
  xs: { diameter: 24, fontSize: 10, statusSize: 8 },
  sm: { diameter: 32, fontSize: 12, statusSize: 10 },
  md: { diameter: 40, fontSize: 14, statusSize: 12 },
  lg: { diameter: 56, fontSize: 18, statusSize: 14 },
  xl: { diameter: 80, fontSize: 24, statusSize: 16 },
  '2xl': { diameter: 120, fontSize: 36, statusSize: 20 },
};

/**
 * Status color mapping
 */
const statusColors: Record<AvatarStatus, string> = {
  online: '#22C55E',
  offline: '#737373',
  busy: '#EF4444',
  away: '#F59E0B',
};

/**
 * Extract initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  source,
  name,
  size = 'md',
  rounded = true,
  status,
  style,
}: AvatarProps) {
  const { colors } = useTheme();
  const config = sizeConfig[size];

  const initials = useMemo(() => {
    return name ? getInitials(name) : '?';
  }, [name]);

  const containerStyle: ViewStyle = {
    width: config.diameter,
    height: config.diameter,
    borderRadius: rounded ? config.diameter / 2 : config.diameter * 0.2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  const imageStyle = {
    width: config.diameter,
    height: config.diameter,
  };

  const initialsStyle = {
    color: colors.textOnPrimary,
    fontSize: config.fontSize,
    fontWeight: fontWeights.semibold,
  };

  const statusStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: config.statusSize,
    height: config.statusSize,
    borderRadius: config.statusSize / 2,
    backgroundColor: status ? statusColors[status] : 'transparent',
    borderWidth: 2,
    borderColor: colors.background,
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      <View style={containerStyle}>
        {source ? (
          <Image source={source} style={imageStyle} />
        ) : (
          <RNText style={initialsStyle}>{initials}</RNText>
        )}
      </View>
      {status && <View style={statusStyle} />}
    </View>
  );
}

/**
 * Avatar group for displaying multiple avatars
 */
Avatar.Group = function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  style,
}: {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const config = sizeConfig[size];

  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const overlapOffset = config.diameter * -0.3;

  const groupStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const itemStyle = (index: number): ViewStyle => ({
    marginLeft: index === 0 ? 0 : overlapOffset,
    zIndex: visibleChildren.length - index,
  });

  const remainingStyle: ViewStyle = {
    width: config.diameter,
    height: config.diameter,
    borderRadius: config.diameter / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: overlapOffset,
  };

  return (
    <View style={[groupStyle, style]}>
      {visibleChildren.map((child, index) => (
        <View key={index} style={itemStyle(index)}>
          {React.isValidElement<AvatarProps>(child)
            ? React.cloneElement(child, { size })
            : child}
        </View>
      ))}
      {remainingCount > 0 && (
        <View style={remainingStyle}>
          <RNText
            style={{
              color: colors.text,
              fontSize: config.fontSize * 0.8,
              fontWeight: fontWeights.medium,
            }}
          >
            +{remainingCount}
          </RNText>
        </View>
      )}
    </View>
  );
};
