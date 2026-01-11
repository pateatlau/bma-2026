# Design System Implementation Guide

This document provides a comprehensive architecture for the BMA 2026 Design System, ensuring visual consistency, accessibility, and optimal cross-platform behavior across Web, Android, and iOS.

## Implementation Status

| Phase   | Description                                                     | Status      |
| ------- | --------------------------------------------------------------- | ----------- |
| Phase 1 | Foundation Tokens (colors, spacing, typography, shadows)        | ✅ Complete |
| Phase 2 | Theme Context with Dark Mode                                    | ✅ Complete |
| Phase 3 | Utility Hooks (useBreakpoint, useResponsiveValue, etc.)         | ✅ Complete |
| Phase 4 | New Components (Typography, Layout, Display)                    | ✅ Complete |
| Phase 5 | Enhanced Core Components (Button, Input, Card, ScreenContainer) | ✅ Complete |
| Phase 6 | Screen Updates (all app screens)                                | ✅ Complete |
| Phase 7 | Documentation                                                   | ✅ Complete |

---

## Overview

**Goal**: Establish a robust, scalable design system that provides consistent UI/UX across all platforms while respecting platform-specific conventions and optimizing for performance.

**Platforms**: Web, Android, iOS (single shared codebase with platform-aware adaptations)

**Design Principles**:

1. **Consistency** - Unified visual language across all platforms
2. **Accessibility** - WCAG 2.1 AA compliance, proper contrast ratios, touch targets
3. **Scalability** - Token-based system that scales from mobile to desktop
4. **Performance** - Optimized rendering, minimal re-renders, efficient style computation
5. **Platform Respect** - Honor native conventions while maintaining brand identity

---

## File Structure (Implemented)

\`\`\`
constants/
├── tokens/
│ ├── colors.ts # Color primitives and semantic tokens
│ ├── typography.ts # Font sizes, weights, families
│ ├── spacing.ts # Spacing scale and semantic spacing
│ ├── borders.ts # Border radius tokens
│ ├── shadows.ts # Shadow definitions (cross-platform)
│ ├── animation.ts # Duration and easing tokens
│ ├── breakpoints.ts # Responsive breakpoints
│ ├── layout.ts # Layout tokens (maxWidth, headerHeight, etc.)
│ └── index.ts # Unified export
└── theme.ts # Legacy support, imports from tokens

components/
├── typography/
│ ├── Text.tsx # Body text with variants
│ ├── Heading.tsx # Semantic headings (h1-h4)
│ ├── Label.tsx # Form labels
│ ├── Caption.tsx # Small captions
│ └── index.ts
├── layout/
│ ├── Stack.tsx # Vertical/horizontal stack with gap
│ ├── Divider.tsx # Horizontal/vertical dividers
│ ├── Spacer.tsx # Fixed or flexible spacing
│ ├── Container.tsx # Responsive max-width container
│ └── index.ts
├── display/
│ ├── Icon.tsx # Themed icon wrapper
│ ├── Avatar.tsx # User avatars with initials
│ ├── Badge.tsx # Status badges
│ └── index.ts
├── navigation/
│ ├── WebHeader.tsx # Desktop horizontal nav
│ ├── MobileHeader.tsx # Mobile header bar
│ ├── MobileDrawer.tsx # Mobile drawer menu
│ └── index.ts
├── Button.tsx # Enhanced with variants, sizes, icons
├── Card.tsx # Enhanced with variants, press states
├── Input.tsx # Enhanced with variants, accessibility
├── ScreenContainer.tsx # Enhanced with responsive padding
└── index.ts # Unified component exports

hooks/
├── useMediaQuery.ts # Screen size and platform detection
├── useBreakpoint.ts # Responsive breakpoint utilities
├── useResponsiveValue.ts # Responsive value selection
├── useAccessibility.ts # Accessibility props helper
├── usePlatform.ts # Platform detection utilities
└── index.ts

utils/
├── colors.ts # Color manipulation (withOpacity, etc.)
├── responsive.ts # Responsive utilities
└── platform.ts # Platform detection utilities
\`\`\`

---

## Design Tokens

### Colors

**File**: \`constants/tokens/colors.ts\`

#### Primitive Colors

\`\`\`typescript
const primitives = {
red: {
50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA',
300: '#FCA5A5', 400: '#F87171', 500: '#EF4444',
600: '#DC2626', 700: '#B91C1C', 800: '#991B1B', 900: '#7F1D1D',
},
gray: {
50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E5E5',
300: '#D4D4D4', 400: '#A3A3A3', 500: '#737373',
600: '#525252', 700: '#404040', 800: '#262626',
900: '#171717', 950: '#0A0A0A',
},
// Accent colors
blue: { 500: '#3B82F6', 600: '#2563EB' },
green: { 500: '#22C55E', 600: '#16A34A' },
yellow: { 500: '#EAB308', 600: '#CA8A04' },
purple: { 500: '#8B5CF6', 600: '#7C3AED' },
};
\`\`\`

#### Semantic Color Tokens (Theme-Aware)

| Token             | Dark Mode  | Light Mode | Usage                       |
| ----------------- | ---------- | ---------- | --------------------------- |
| \`primary\`       | red.600    | red.600    | Primary actions, brand      |
| \`background\`    | gray.950   | white      | Page background             |
| \`surface\`       | gray.800   | red.50     | Cards, elevated surfaces    |
| \`text\`          | white      | gray.950   | Primary text                |
| \`textSecondary\` | gray.400   | gray.600   | Secondary text              |
| \`textMuted\`     | gray.500   | gray.500   | Muted/disabled text         |
| \`textOnPrimary\` | white      | white      | Text on primary backgrounds |
| \`border\`        | gray.700   | red.200    | Default borders             |
| \`borderLight\`   | gray.800   | red.100    | Subtle borders              |
| \`error\`         | red.500    | red.600    | Error states                |
| \`success\`       | green.500  | green.600  | Success states              |
| \`accentBlue\`    | blue.500   | blue.600   | Info/accent                 |
| \`accentPurple\`  | purple.500 | purple.600 | Accent                      |
| \`accentGreen\`   | green.500  | green.600  | Accent                      |

### Typography

**File**: \`constants/tokens/typography.ts\`

#### Font Sizes

| Token    | Size | Line Height | Usage                  |
| -------- | ---- | ----------- | ---------------------- |
| \`xs\`   | 12px | 16px        | Captions, badges       |
| \`sm\`   | 14px | 20px        | Secondary text, labels |
| \`md\`   | 16px | 24px        | Body text (default)    |
| \`lg\`   | 18px | 28px        | Emphasized body        |
| \`xl\`   | 20px | 28px        | Subheadings            |
| \`xxl\`  | 24px | 32px        | Section headings       |
| \`xxxl\` | 32px | 40px        | Page headings          |

#### Font Weights

| Token        | Value | Usage                |
| ------------ | ----- | -------------------- |
| \`regular\`  | 400   | Body text            |
| \`medium\`   | 500   | Emphasis, labels     |
| \`semibold\` | 600   | Subheadings, buttons |
| \`bold\`     | 700   | Headings             |

### Spacing

**File**: \`constants/tokens/spacing.ts\`

#### Base Scale (4px unit)

| Token   | Value | Usage               |
| ------- | ----- | ------------------- |
| \`xs\`  | 4px   | Tight spacing       |
| \`sm\`  | 8px   | Small gaps          |
| \`md\`  | 16px  | Default spacing     |
| \`lg\`  | 24px  | Large gaps          |
| \`xl\`  | 32px  | Section spacing     |
| \`xxl\` | 48px  | Extra large spacing |

#### Semantic Spacing

| Token                   | Value | Usage                     |
| ----------------------- | ----- | ------------------------- |
| \`componentPadding.sm\` | 8px   | Small component padding   |
| \`componentPadding.md\` | 16px  | Default component padding |
| \`componentPadding.lg\` | 24px  | Large component padding   |
| \`stackGap.xs\`         | 4px   | Tight vertical gap        |
| \`stackGap.sm\`         | 8px   | Small vertical gap        |
| \`stackGap.md\`         | 16px  | Default vertical gap      |
| \`stackGap.lg\`         | 24px  | Large vertical gap        |
| \`stackGap.xl\`         | 32px  | Extra large gap           |

### Border Radius

**File**: \`constants/tokens/borders.ts\`

| Token    | Value  | Usage                     |
| -------- | ------ | ------------------------- |
| \`none\` | 0      | Sharp corners             |
| \`sm\`   | 4px    | Subtle rounding           |
| \`md\`   | 8px    | Default (buttons, inputs) |
| \`lg\`   | 12px   | Cards, containers         |
| \`xl\`   | 16px   | Large cards, modals       |
| \`2xl\`  | 24px   | Pills, tags               |
| \`full\` | 9999px | Circles                   |

### Layout Tokens

**File**: \`constants/tokens/layout.ts\`

\`\`\`typescript
export const maxWidth = {
xs: 320,
sm: 480,
md: 640,
lg: 768,
xl: 1024,
'2xl': 1280,
};

export const container = {
auth: { maxWidth: 440, padding: 24 },
content: { maxWidth: 1200, padding: 24 },
};

export const iconSizes = {
xs: 12,
sm: 16,
md: 20,
lg: 24,
xl: 32,
'2xl': 48,
};
\`\`\`

---

## Component API Reference

### Typography Components

#### Text

\`\`\`typescript
interface TextProps {
children: React.ReactNode;
variant?: 'body' | 'small' | 'large';
color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
weight?: 'regular' | 'medium' | 'semibold' | 'bold';
align?: 'left' | 'center' | 'right';
numberOfLines?: number;
style?: TextStyle;
}
\`\`\`

#### Heading

\`\`\`typescript
interface HeadingProps {
children: React.ReactNode;
level: 'h1' | 'h2' | 'h3' | 'h4';
color?: 'primary' | 'secondary' | 'muted';
align?: 'left' | 'center' | 'right';
style?: TextStyle;
}
\`\`\`

### Layout Components

#### Stack

\`\`\`typescript
interface StackProps {
children: React.ReactNode;
direction?: 'vertical' | 'horizontal';
gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
align?: 'start' | 'center' | 'end' | 'stretch';
justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
wrap?: boolean;
style?: ViewStyle;
}

// Aliases
export const VStack = Stack; // direction="vertical"
export const HStack = Stack; // direction="horizontal"
export const Row = HStack; // Alias for HStack
\`\`\`

#### Spacer

\`\`\`typescript
interface SpacerProps {
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;
direction?: 'horizontal' | 'vertical';
flex?: boolean; // Expands to fill space if no size
}
\`\`\`

#### Divider

\`\`\`typescript
interface DividerProps {
orientation?: 'horizontal' | 'vertical';
variant?: 'solid' | 'dashed';
spacing?: 'none' | 'sm' | 'md' | 'lg';
label?: string;
style?: ViewStyle;
}
\`\`\`

### Display Components

#### Avatar

\`\`\`typescript
interface AvatarProps {
source?: ImageSourcePropType;
name?: string; // For initials fallback
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
status?: 'online' | 'offline' | 'busy';
style?: ViewStyle;
}
\`\`\`

#### Badge

\`\`\`typescript
interface BadgeProps {
children: React.ReactNode;
variant?: 'solid' | 'soft' | 'outline';
color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
size?: 'sm' | 'md' | 'lg';
style?: ViewStyle;
}
\`\`\`

#### Icon

\`\`\`typescript
interface IconProps {
name: keyof typeof Ionicons.glyphMap;
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
color?: keyof ThemeColors | string;
style?: ViewStyle;
}
\`\`\`

### Core Components (Enhanced)

#### Button

\`\`\`typescript
interface ButtonProps {
title?: string;
onPress: () => void;
variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger' | 'dangerOutline';
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
disabled?: boolean;
loading?: boolean;
leftIcon?: IconName;
rightIcon?: IconName;
iconOnly?: boolean;
fullWidth?: boolean;
rounded?: boolean;
style?: ViewStyle;
textStyle?: TextStyle;
}
\`\`\`

#### Input

\`\`\`typescript
interface InputProps extends TextInputProps {
label?: string;
error?: string;
helperText?: string;
variant?: 'default' | 'filled' | 'underline';
size?: 'sm' | 'md' | 'lg';
leftIcon?: IconName;
rightIcon?: IconName;
onRightIconPress?: () => void;
required?: boolean;
disabled?: boolean;
containerStyle?: ViewStyle;
}
\`\`\`

#### Card

\`\`\`typescript
interface CardProps {
children: React.ReactNode;
variant?: 'default' | 'outlined' | 'elevated' | 'filled';
padding?: 'none' | 'sm' | 'md' | 'lg';
onPress?: () => void;
onLongPress?: () => void;
disabled?: boolean;
style?: ViewStyle;
}

// Sub-components
Card.Header
Card.Body
Card.Footer
\`\`\`

#### ScreenContainer

\`\`\`typescript
interface ScreenContainerProps {
children: React.ReactNode;
scrollable?: boolean;
centered?: boolean;
padding?: 'none' | 'sm' | 'md' | 'lg' | 'responsive';
safeAreaTop?: boolean;
safeAreaBottom?: boolean;
maxWidth?: number;
style?: ViewStyle;
contentStyle?: ViewStyle;
}

// Sub-components
ScreenContainer.Header
ScreenContainer.Body
ScreenContainer.Footer
\`\`\`

---

## Utility Hooks

### useBreakpoint

\`\`\`typescript
function useBreakpoint(): {
isXs: boolean; // < 480px
isSm: boolean; // 480-767px
isMd: boolean; // 768-1023px
isLg: boolean; // 1024-1279px
isXl: boolean; // >= 1280px
isMobile: boolean; // < 768px
isTablet: boolean; // 768-1023px
isDesktop: boolean; // >= 1024px
current: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
\`\`\`

### useResponsiveValue

\`\`\`typescript
function useResponsiveValue<T>(
value: T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T },
defaultValue: T
): T;

// Usage
const padding = useResponsiveValue({ xs: 16, md: 24, lg: 32 }, 16);
\`\`\`

### usePlatform

\`\`\`typescript
function usePlatform(): {
isWeb: boolean;
isIOS: boolean;
isAndroid: boolean;
isMobile: boolean;
platform: 'web' | 'ios' | 'android';
}
\`\`\`

### useAccessibility

\`\`\`typescript
function useAccessibility(options: {
label: string;
hint?: string;
role?: AccessibilityRole;
state?: AccessibilityState;
}): AccessibilityProps;
\`\`\`

---

## Color Utilities

**File**: \`utils/colors.ts\`

\`\`\`typescript
// Apply opacity to hex color
function withOpacity(hexColor: string, opacity: number): string;
// withOpacity('#DC2626', 0.1) → 'rgba(220, 38, 38, 0.1)'

// Get contrasting text color
function getContrastText(hexColor: string): '#FFFFFF' | '#000000';
\`\`\`

---

## Usage Examples

### Basic Screen Layout

\`\`\`tsx
import { ScreenContainer, Stack, Heading, Text, Card, Spacer } from '@/components';

export default function MyScreen() {
return (
<ScreenContainer scrollable padding="lg" safeAreaBottom>
<Stack gap="lg">
<Heading level="h1">Welcome</Heading>
<Text color="secondary">This is a description</Text>

        <Spacer size="md" />

        <Card variant="elevated" padding="lg">
          <Stack gap="sm">
            <Heading level="h3">Card Title</Heading>
            <Text>Card content here</Text>
          </Stack>
        </Card>
      </Stack>
    </ScreenContainer>

);
}
\`\`\`

### Form Layout

\`\`\`tsx
import { Stack, Input, Button, Spacer } from '@/components';

export default function LoginForm() {
return (
<Stack gap="md">
<Input
        label="Email"
        placeholder="Enter your email"
        leftIcon="mail-outline"
        size="lg"
      />
<Input
        label="Password"
        placeholder="Enter your password"
        leftIcon="lock-closed-outline"
        secureTextEntry
        size="lg"
      />
<Spacer size="sm" />
<Button
        title="Sign In"
        onPress={handleLogin}
        size="lg"
        fullWidth
      />
</Stack>
);
}
\`\`\`

### Responsive Layout

\`\`\`tsx
import { useBreakpoint, useResponsiveValue } from '@/hooks';
import { Row, Card } from '@/components';

export default function ResponsiveGrid() {
const { isMobile } = useBreakpoint();
const columns = useResponsiveValue({ xs: 1, md: 2, lg: 3 }, 1);

return (
<Row gap="md" wrap>
{items.map(item => (
<Card key={item.id} style={{ flex: isMobile ? 1 : 1/columns }}>
{/_ Card content _/}
</Card>
))}
</Row>
);
}
\`\`\`

---

## Android Barrel Import Issue

**Important Note**: When using design tokens, avoid importing from the barrel export (\`@/constants/tokens\`) in components that are loaded early in the app lifecycle or in navigation components.

### Problem

The barrel export causes all token files to be evaluated at module load time. The \`typography.ts\` file uses \`Platform.select()\` at module level, which can cause issues on Android when evaluated in certain contexts.

### Solution

Import directly from specific token files:
\`\`\`typescript
// ✅ Good - Direct imports
import { spacing, borderRadius } from '@/constants/theme';

// ❌ Avoid in navigation components
import { spacing, borderRadius } from '@/constants/tokens';
\`\`\`

This issue primarily affects navigation components (\`WebHeader.tsx\`, \`MobileHeader.tsx\`, \`MobileDrawer.tsx\`). Regular screen components can safely use the barrel export.

---

## Testing Checklist

### Visual Testing

- [x] All components render correctly in light mode
- [x] All components render correctly in dark mode
- [x] Components scale properly across breakpoints
- [x] Touch targets meet minimum size requirements
- [x] Colors meet contrast requirements

### Platform Testing

- [x] Web: Hover states work
- [x] Web: Focus states visible and clear
- [x] iOS: System font renders correctly
- [x] iOS: Safe areas respected
- [x] Android: Elevation shadows correct
- [x] Android: App loads without crashes

### Cross-Platform Verification

- [x] Web browser (Chrome, Safari, Firefox)
- [x] iOS Simulator
- [x] Android Emulator
- [x] Physical Android device

---

## Migration Notes

### Updating Existing Screens

When updating screens to use the design system:

1. Replace \`<View>\` layouts with \`<Stack>\` and \`<Row>\`
2. Replace \`<Text>\` with typography components (\`<Text>\`, \`<Heading>\`)
3. Replace manual spacing with \`<Spacer>\`
4. Use semantic color props (\`color="secondary"\`) instead of inline styles
5. Use \`withOpacity()\` utility instead of inline rgba values
6. Replace hardcoded dimensions with token values

### Backwards Compatibility

The existing \`constants/theme.ts\` exports continue to work. The new token system is additive:

- \`spacing\`, \`typography\`, \`borderRadius\` from theme.ts still work
- New tokens available via \`@/constants/tokens\`
- Components accept both old and new prop patterns

---

## Dependencies

No additional dependencies required. The design system is built entirely on:

- React Native core components
- @expo/vector-icons (already installed)
- react-native-safe-area-context (already installed)
