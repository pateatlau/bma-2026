# Design System Implementation Guide

This document provides a comprehensive architecture for the BMA 2026 Design System, ensuring visual consistency, accessibility, and optimal cross-platform behavior across Web, Android, and iOS.

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

## Current State Analysis

### Existing Foundation

The project has an initial theme system with:

- ✅ Color palette (dark/light themes)
- ✅ Spacing scale (xs through xxl)
- ✅ Border radius tokens
- ✅ Typography basics (sizes, weights)
- ✅ Shadow definitions
- ✅ Basic components (Button, Input, Card, ScreenContainer)

### Gaps to Address

- ❌ Comprehensive typography system with text components
- ❌ Icon system with consistent sizing
- ❌ Animation/motion tokens
- ❌ Responsive breakpoints system
- ❌ Component variants documentation
- ❌ Accessibility utilities
- ❌ Platform-specific adaptations
- ❌ Form components (Checkbox, Radio, Select, Switch)
- ❌ Feedback components (Toast, Alert, Modal)
- ❌ Layout components (Stack, Grid, Divider)
- ❌ Data display components (Badge, Avatar, List)

---

## Design Token Architecture

### Phase 1: Foundation Tokens

#### 1.1 Color System

**File**: `constants/theme.ts` (extend existing)

**Primitive Colors** (raw values):

```typescript
const primitives = {
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626', // Primary
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  // Semantic colors
  blue: { 500: '#3B82F6', 600: '#2563EB' },
  green: { 500: '#22C55E', 600: '#16A34A' },
  yellow: { 500: '#EAB308', 600: '#CA8A04' },
  orange: { 500: '#F97316', 600: '#EA580C' },
  purple: { 500: '#8B5CF6', 600: '#7C3AED' },
};
```

**Semantic Color Tokens**:
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `primary` | red.600 | red.600 | Primary actions, brand |
| `primaryHover` | red.500 | red.700 | Hover states |
| `primaryActive` | red.700 | red.800 | Active/pressed states |
| `background` | gray.950 | white | Page background |
| `surface` | gray.800 | red.50 | Cards, elevated surfaces |
| `surfaceHover` | gray.700 | red.100 | Surface hover state |
| `text` | white | gray.950 | Primary text |
| `textSecondary` | gray.400 | gray.600 | Secondary text |
| `textMuted` | gray.500 | gray.500 | Muted/disabled text |
| `border` | gray.700 | red.200 | Default borders |
| `borderLight` | gray.800 | red.100 | Subtle borders |
| `error` | red.500 | red.600 | Error states |
| `success` | green.500 | green.600 | Success states |
| `warning` | yellow.500 | yellow.600 | Warning states |
| `info` | blue.500 | blue.600 | Info states |

**Contrast Requirements**:

- Text on background: minimum 4.5:1 (AA)
- Large text (18px+): minimum 3:1
- Interactive elements: minimum 3:1 against adjacent colors

#### 1.2 Typography System

**File**: `constants/typography.ts` (new file)

**Type Scale** (based on 1.25 ratio):
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `xs` | 12px | 16px (1.33) | Captions, badges |
| `sm` | 14px | 20px (1.43) | Secondary text, labels |
| `base` | 16px | 24px (1.5) | Body text (default) |
| `lg` | 18px | 28px (1.56) | Emphasized body |
| `xl` | 20px | 28px (1.4) | Subheadings |
| `2xl` | 24px | 32px (1.33) | Section headings |
| `3xl` | 32px | 40px (1.25) | Page headings |
| `4xl` | 40px | 48px (1.2) | Hero text |

**Font Weights**:
| Token | Value | Usage |
|-------|-------|-------|
| `regular` | 400 | Body text |
| `medium` | 500 | Emphasis, labels |
| `semibold` | 600 | Subheadings, buttons |
| `bold` | 700 | Headings |

**Platform Font Stacks**:

```typescript
const fontFamily = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  ios: 'System', // Uses SF Pro automatically
  android: 'Roboto',
  default: undefined, // System default
});
```

#### 1.3 Spacing System

**File**: `constants/spacing.ts` (new file)

**Base Unit**: 4px

| Token | Value | Usage                 |
| ----- | ----- | --------------------- |
| `0`   | 0     | No spacing            |
| `px`  | 1px   | Hairline borders      |
| `0.5` | 2px   | Micro spacing         |
| `1`   | 4px   | Tight spacing         |
| `2`   | 8px   | Small gaps            |
| `3`   | 12px  | Medium-small gaps     |
| `4`   | 16px  | Default spacing       |
| `5`   | 20px  | Medium gaps           |
| `6`   | 24px  | Large gaps            |
| `8`   | 32px  | Section spacing       |
| `10`  | 40px  | Large section spacing |
| `12`  | 48px  | Extra large spacing   |
| `16`  | 64px  | Page margins          |
| `20`  | 80px  | Hero spacing          |

**Semantic Spacing**:
| Token | Value | Usage |
|-------|-------|-------|
| `componentPadding.sm` | 8px | Small component internal padding |
| `componentPadding.md` | 16px | Default component internal padding |
| `componentPadding.lg` | 24px | Large component internal padding |
| `stackGap.sm` | 8px | Small vertical stack gap |
| `stackGap.md` | 16px | Default vertical stack gap |
| `stackGap.lg` | 24px | Large vertical stack gap |
| `screenPadding` | 16px (mobile) / 24px (tablet+) | Screen edge padding |
| `sectionGap` | 32px | Gap between page sections |

#### 1.4 Border Radius System

**File**: `constants/borders.ts` (new file)

| Token  | Value  | Usage                     |
| ------ | ------ | ------------------------- |
| `none` | 0      | Sharp corners             |
| `sm`   | 4px    | Subtle rounding (badges)  |
| `md`   | 8px    | Default (buttons, inputs) |
| `lg`   | 12px   | Cards, containers         |
| `xl`   | 16px   | Large cards, modals       |
| `2xl`  | 24px   | Pills, tags               |
| `full` | 9999px | Circles, pills            |

#### 1.5 Shadow System

**File**: `constants/shadows.ts` (new file)

| Token  | Properties                             | Usage            |
| ------ | -------------------------------------- | ---------------- |
| `none` | none                                   | Flat elements    |
| `sm`   | offset: 0,1 / blur: 2 / opacity: 0.1   | Subtle lift      |
| `md`   | offset: 0,2 / blur: 4 / opacity: 0.15  | Cards, dropdowns |
| `lg`   | offset: 0,4 / blur: 8 / opacity: 0.2   | Modals, popovers |
| `xl`   | offset: 0,8 / blur: 16 / opacity: 0.25 | Dialogs          |

**Platform Considerations**:

- iOS: Uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- Android: Uses `elevation` (converts shadow to elevation value)
- Web: Uses CSS `box-shadow`

#### 1.6 Animation Tokens

**File**: `constants/animation.ts` (new file)

**Duration**:
| Token | Value | Usage |
|-------|-------|-------|
| `instant` | 0ms | No animation |
| `fast` | 100ms | Micro-interactions |
| `normal` | 200ms | Default transitions |
| `slow` | 300ms | Page transitions |
| `slower` | 500ms | Complex animations |

**Easing**:
| Token | Value | Usage |
|-------|-------|-------|
| `linear` | linear | Constant speed |
| `easeIn` | cubic-bezier(0.4, 0, 1, 1) | Acceleration |
| `easeOut` | cubic-bezier(0, 0, 0.2, 1) | Deceleration |
| `easeInOut` | cubic-bezier(0.4, 0, 0.2, 1) | Default |
| `spring` | spring config | Bouncy feel |

---

### Phase 2: Responsive System

#### 2.1 Breakpoints

**File**: `constants/breakpoints.ts` (new file)

| Token | Min Width | Description                |
| ----- | --------- | -------------------------- |
| `xs`  | 0         | Mobile portrait            |
| `sm`  | 480px     | Mobile landscape           |
| `md`  | 768px     | Tablet portrait            |
| `lg`  | 1024px    | Tablet landscape / Desktop |
| `xl`  | 1280px    | Large desktop              |
| `2xl` | 1536px    | Extra large desktop        |

**Hook Implementation**:

```typescript
// hooks/useBreakpoint.ts
export function useBreakpoint() {
  const { width } = useWindowDimensions();

  return {
    isXs: width < 480,
    isSm: width >= 480 && width < 768,
    isMd: width >= 768 && width < 1024,
    isLg: width >= 1024 && width < 1280,
    isXl: width >= 1280 && width < 1536,
    is2xl: width >= 1536,
    // Semantic helpers
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    // Current breakpoint
    current:
      width < 480
        ? 'xs'
        : width < 768
          ? 'sm'
          : width < 1024
            ? 'md'
            : width < 1280
              ? 'lg'
              : width < 1536
                ? 'xl'
                : '2xl',
  };
}
```

#### 2.2 Responsive Values Helper

```typescript
// utils/responsive.ts
type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

export function useResponsiveValue<T>(value: ResponsiveValue<T>, defaultValue: T): T {
  const { current } = useBreakpoint();

  if (typeof value !== 'object' || value === null) {
    return value as T;
  }

  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpoints.indexOf(current);

  // Find the closest defined value at or below current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpoints[i] as keyof typeof value;
    if (value[bp] !== undefined) {
      return value[bp] as T;
    }
  }

  return defaultValue;
}
```

---

### Phase 3: Component Library

#### 3.1 Typography Components

**File**: `components/Text.tsx` (new file)

**Variants**:
| Component | Size | Weight | Usage |
|-----------|------|--------|-------|
| `Text` | base | regular | Body text |
| `Text.Small` | sm | regular | Secondary text |
| `Text.Large` | lg | regular | Emphasized body |
| `Heading.H1` | 3xl | bold | Page titles |
| `Heading.H2` | 2xl | bold | Section headings |
| `Heading.H3` | xl | semibold | Subsection headings |
| `Heading.H4` | lg | semibold | Card headings |
| `Label` | sm | medium | Form labels |
| `Caption` | xs | regular | Captions, hints |

**Props**:

```typescript
interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'small' | 'large';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success' | keyof ThemeColors;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  selectable?: boolean;
  style?: TextStyle;
}
```

#### 3.2 Button Component (enhance existing)

**File**: `components/Button.tsx` (enhance)

**Variants**:
| Variant | Background | Text Color | Border | Usage |
|---------|------------|------------|--------|-------|
| `solid` | primary | white | none | Primary actions |
| `outline` | transparent | primary | primary | Secondary actions |
| `ghost` | transparent | primary | none | Tertiary actions |
| `soft` | primary/10 | primary | none | Soft emphasis |
| `danger` | error | white | none | Destructive actions |
| `dangerOutline` | transparent | error | error | Destructive secondary |

**Sizes**:
| Size | Height | Padding H | Font Size | Icon Size |
|------|--------|-----------|-----------|-----------|
| `xs` | 28px | 8px | 12px | 14px |
| `sm` | 36px | 12px | 14px | 16px |
| `md` | 44px | 16px | 16px | 18px |
| `lg` | 52px | 20px | 18px | 20px |
| `xl` | 60px | 24px | 20px | 24px |

**Additional Props**:

```typescript
interface ButtonProps {
  // Existing props...
  leftIcon?: IconName;
  rightIcon?: IconName;
  iconOnly?: boolean;
  fullWidth?: boolean;
  rounded?: boolean; // Uses full border radius
}
```

#### 3.3 Icon Component

**File**: `components/Icon.tsx` (new file)

**Sizes**:
| Size | Value | Usage |
|------|-------|-------|
| `xs` | 14px | Inline with small text |
| `sm` | 16px | Inline with body text |
| `md` | 20px | Default, buttons |
| `lg` | 24px | Emphasis, cards |
| `xl` | 32px | Feature icons |
| `2xl` | 48px | Hero sections |

**Props**:

```typescript
interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  color?: keyof ThemeColors | string;
  style?: ViewStyle;
}
```

#### 3.4 Avatar Component

**File**: `components/Avatar.tsx` (new file)

**Sizes**:
| Size | Diameter | Font Size | Usage |
|------|----------|-----------|-------|
| `xs` | 24px | 10px | Inline, stacks |
| `sm` | 32px | 12px | List items |
| `md` | 40px | 14px | Comments, cards |
| `lg` | 56px | 18px | Profile headers |
| `xl` | 80px | 24px | Profile pages |
| `2xl` | 120px | 36px | Hero sections |

**Props**:

```typescript
interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string; // For initials fallback
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: boolean; // Full circle vs rounded square
  badge?: 'online' | 'offline' | 'busy' | React.ReactNode;
  style?: ViewStyle;
}
```

#### 3.5 Badge Component

**File**: `components/Badge.tsx` (new file)

**Variants**:
| Variant | Background | Text Color | Usage |
|---------|------------|------------|-------|
| `solid` | color | white | High emphasis |
| `soft` | color/10 | color | Medium emphasis |
| `outline` | transparent | color | Low emphasis |

**Colors**: `primary`, `secondary`, `success`, `warning`, `error`, `info`

**Sizes**:
| Size | Height | Padding H | Font Size |
|------|--------|-----------|-----------|
| `sm` | 18px | 6px | 10px |
| `md` | 22px | 8px | 12px |
| `lg` | 26px | 10px | 14px |

#### 3.6 Divider Component

**File**: `components/Divider.tsx` (new file)

**Props**:

```typescript
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: keyof ThemeColors;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  label?: string; // For labeled dividers
}
```

#### 3.7 Stack Component

**File**: `components/Stack.tsx` (new file)

**Props**:

```typescript
interface StackProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  gap?: keyof typeof spacing | number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  divider?: boolean;
  style?: ViewStyle;
}

// Shortcuts
export const VStack = (props) => <Stack direction="vertical" {...props} />;
export const HStack = (props) => <Stack direction="horizontal" {...props} />;
```

#### 3.8 Form Components

**Checkbox** (`components/Checkbox.tsx`):

```typescript
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}
```

**Radio** (`components/Radio.tsx`):

```typescript
interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  error?: string;
}
```

**Switch** (`components/Switch.tsx`):

```typescript
interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Select** (`components/Select.tsx`):

```typescript
interface SelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
}
```

#### 3.9 Feedback Components

**Toast** (`components/Toast.tsx`):

```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: { label: string; onPress: () => void };
  position?: 'top' | 'bottom';
}

// Toast context for imperative usage
const toast = {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
};
```

**Alert** (`components/Alert.tsx`):

```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
  action?: { label: string; onPress: () => void };
}
```

**Modal** (`components/Modal.tsx`):

```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

---

### Phase 4: Platform Adaptations

#### 4.1 Touch Target Sizes

**Minimum Touch Targets**:
| Platform | Minimum Size | Recommended |
|----------|--------------|-------------|
| iOS | 44x44 pt | 48x48 pt |
| Android | 48x48 dp | 48x48 dp |
| Web | 44x44 px | 48x48 px |

**Implementation**: All interactive elements should have `minHeight` and `minWidth` of at least 44px, with proper hit slop for smaller visual elements.

#### 4.2 Platform-Specific Behaviors

**iOS Adaptations**:

- Use `SF Pro` system font
- Respect `SafeAreaView` for notches
- Use iOS-style back gestures
- Haptic feedback for interactions

**Android Adaptations**:

- Use `Roboto` system font
- Handle Android back button
- Use Material Design elevation
- Ripple effect for touch feedback

**Web Adaptations**:

- Keyboard navigation support
- Focus visible states
- Hover states
- Cursor styles
- Remove browser focus outlines (custom focus indicators)

#### 4.3 Accessibility

**File**: `utils/accessibility.ts` (new file)

**Requirements**:

- All images have `accessibilityLabel`
- Interactive elements have `accessibilityRole`
- Form inputs have `accessibilityLabel` and `accessibilityHint`
- Error states announced with `accessibilityLiveRegion`
- Proper heading hierarchy with `accessibilityRole="header"`

**Helper Hook**:

```typescript
export function useAccessibility(options: {
  label: string;
  hint?: string;
  role?: AccessibilityRole;
  state?: AccessibilityState;
}) {
  return {
    accessible: true,
    accessibilityLabel: options.label,
    accessibilityHint: options.hint,
    accessibilityRole: options.role,
    accessibilityState: options.state,
  };
}
```

---

## Implementation Plan

### Step 1: Restructure Token Files

**Files to create/modify**:

- `constants/tokens/colors.ts` - Color primitives and semantic tokens
- `constants/tokens/typography.ts` - Font sizes, weights, families
- `constants/tokens/spacing.ts` - Spacing scale
- `constants/tokens/borders.ts` - Border radius, widths
- `constants/tokens/shadows.ts` - Shadow definitions
- `constants/tokens/animation.ts` - Duration, easing
- `constants/tokens/breakpoints.ts` - Responsive breakpoints
- `constants/tokens/index.ts` - Unified export

### Step 2: Update Theme Context

**File**: `contexts/ThemeContext.tsx`

- Import tokens from new structure
- Add complete semantic color mapping
- Add theme-aware token access

### Step 3: Create Typography Components

**Files to create**:

- `components/typography/Text.tsx`
- `components/typography/Heading.tsx`
- `components/typography/Label.tsx`
- `components/typography/Caption.tsx`
- `components/typography/index.ts`

### Step 4: Create Layout Components

**Files to create**:

- `components/layout/Stack.tsx`
- `components/layout/Divider.tsx`
- `components/layout/Spacer.tsx`
- `components/layout/Container.tsx`
- `components/layout/index.ts`

### Step 5: Create Display Components

**Files to create**:

- `components/display/Icon.tsx`
- `components/display/Avatar.tsx`
- `components/display/Badge.tsx`
- `components/display/index.ts`

### Step 6: Create Form Components

**Files to create**:

- `components/form/Checkbox.tsx`
- `components/form/Radio.tsx`
- `components/form/Switch.tsx`
- `components/form/Select.tsx`
- `components/form/FormField.tsx`
- `components/form/index.ts`

### Step 7: Create Feedback Components

**Files to create**:

- `components/feedback/Toast.tsx`
- `components/feedback/ToastProvider.tsx`
- `components/feedback/Alert.tsx`
- `components/feedback/Modal.tsx`
- `components/feedback/index.ts`

### Step 8: Enhance Existing Components

**Files to modify**:

- `components/Button.tsx` - Add new variants, icons, sizes
- `components/Input.tsx` - Add variants, enhance accessibility
- `components/Card.tsx` - Add variants, press states
- `components/ScreenContainer.tsx` - Add responsive padding

### Step 9: Create Utility Hooks

**Files to create**:

- `hooks/useBreakpoint.ts`
- `hooks/useResponsiveValue.ts`
- `hooks/useAccessibility.ts`
- `hooks/usePlatform.ts`

### Step 10: Update Component Index

**File**: `components/index.ts`

- Export all new components
- Organize by category

---

## File Structure (Final)

```
constants/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── borders.ts
│   ├── shadows.ts
│   ├── animation.ts
│   ├── breakpoints.ts
│   └── index.ts
└── theme.ts              # Legacy support, imports from tokens

components/
├── typography/
│   ├── Text.tsx
│   ├── Heading.tsx
│   ├── Label.tsx
│   ├── Caption.tsx
│   └── index.ts
├── layout/
│   ├── Stack.tsx
│   ├── Divider.tsx
│   ├── Spacer.tsx
│   ├── Container.tsx
│   └── index.ts
├── display/
│   ├── Icon.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── index.ts
├── form/
│   ├── Input.tsx         # Move from root
│   ├── Checkbox.tsx
│   ├── Radio.tsx
│   ├── Switch.tsx
│   ├── Select.tsx
│   ├── FormField.tsx
│   └── index.ts
├── feedback/
│   ├── Toast.tsx
│   ├── ToastProvider.tsx
│   ├── Alert.tsx
│   ├── Modal.tsx
│   └── index.ts
├── navigation/           # Existing
│   ├── WebHeader.tsx
│   ├── MobileHeader.tsx
│   ├── MobileDrawer.tsx
│   └── index.ts
├── Button.tsx
├── Card.tsx
├── ScreenContainer.tsx
└── index.ts

hooks/
├── useMediaQuery.ts      # Existing
├── useBreakpoint.ts
├── useResponsiveValue.ts
├── useAccessibility.ts
├── usePlatform.ts
└── index.ts

utils/
├── accessibility.ts
├── responsive.ts
└── platform.ts
```

---

## Testing Checklist

### Visual Testing

- [ ] All components render correctly in light mode
- [ ] All components render correctly in dark mode
- [ ] Components scale properly across breakpoints
- [ ] Touch targets meet minimum size requirements
- [ ] Colors meet contrast requirements

### Platform Testing

- [ ] Web: Hover states work
- [ ] Web: Focus states visible and clear
- [ ] Web: Keyboard navigation functional
- [ ] iOS: System font renders correctly
- [ ] iOS: Safe areas respected
- [ ] Android: Elevation shadows correct
- [ ] Android: Back button handled

### Accessibility Testing

- [ ] Screen reader announces elements correctly
- [ ] Focus order is logical
- [ ] Error messages announced
- [ ] Interactive elements have proper roles

### Performance Testing

- [ ] Components don't cause unnecessary re-renders
- [ ] Animations run at 60fps
- [ ] Memory usage stable

---

## Dependencies

No additional dependencies required. The design system is built entirely on:

- React Native core components
- @expo/vector-icons (already installed)
- react-native-safe-area-context (already installed)

---

## Phase 5: Retrofit Existing Codebase

This phase ensures all existing code uses design tokens consistently, eliminating hardcoded values.

### Step 11: Audit Existing Hardcoded Values

**Files to audit**:
| File | Issues to Address |
|------|-------------------|
| `app/(app)/home.tsx` | Hardcoded colors (`#DC2626`, `#3B82F6`, etc.), inline opacity values |
| `app/(app)/profile.tsx` | Hardcoded colors, inline styles |
| `app/(auth)/login.tsx` | Inline styles, hardcoded dimensions |
| `app/(auth)/signup.tsx` | Inline styles, hardcoded dimensions |
| `app/(auth)/forgot-password.tsx` | Inline styles, hardcoded dimensions |
| `components/navigation/WebHeader.tsx` | Hardcoded dimensions, colors |
| `components/navigation/MobileHeader.tsx` | Hardcoded dimensions |
| `components/navigation/MobileDrawer.tsx` | Hardcoded dimensions, colors |
| `components/Button.tsx` | Hardcoded `#FFFFFF` for text |
| `components/Card.tsx` | Minor token usage gaps |
| `components/Input.tsx` | Already uses tokens (good example) |

### Step 12: Create Semantic Color Tokens for Common Patterns

**Add to `constants/tokens/colors.ts`**:

```typescript
// Accent colors for features (used in home.tsx, etc.)
export const accentColors = {
  analytics: { base: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)' }, // red
  team: { base: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' }, // blue
  settings: { base: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' }, // purple
  help: { base: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' }, // green
  warning: { base: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' }, // orange
};

// Opacity values as tokens
export const opacity = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.5,
  subtle: 0.1,
  medium: 0.15,
};
```

### Step 13: Retrofit home.tsx

**Current hardcoded values**:

```typescript
// ❌ Hardcoded
{ icon: 'stats-chart-outline', label: 'Analytics', color: '#DC2626' },
{ icon: 'people-outline', label: 'Team', color: '#3B82F6' },
backgroundColor: 'rgba(220, 38, 38, 0.1)',
backgroundColor: 'rgba(59, 130, 246, 0.1)',
```

**Refactored using tokens**:

```typescript
// ✅ Using tokens
import { accentColors } from '@/constants/tokens';

const QUICK_ACTIONS = [
  { icon: 'stats-chart-outline', label: 'Analytics', color: accentColors.analytics },
  { icon: 'people-outline', label: 'Team', color: accentColors.team },
  { icon: 'settings-outline', label: 'Settings', color: accentColors.settings },
  { icon: 'help-circle-outline', label: 'Help', color: accentColors.help },
];

// Usage
<View style={[styles.actionIcon, { backgroundColor: action.color.bg }]}>
  <Ionicons name={action.icon} size={iconSizes.lg} color={action.color.base} />
</View>
```

### Step 14: Retrofit profile.tsx

**Current hardcoded values**:

```typescript
// ❌ Hardcoded
color: '#FFFFFF'; // avatar text
backgroundColor: 'rgba(220, 38, 38, 0.1)'; // menu icon background
borderColor: 'rgba(239, 68, 68, 0.3)'; // danger zone border
```

**Refactored using tokens**:

```typescript
// ✅ Using tokens
import { colors, opacity } from '@/constants/tokens';

// Avatar text - use semantic token
color: colors.white; // or colors.textOnPrimary

// Menu icon background - use accent color token
backgroundColor: accentColors.analytics.bg;

// Danger zone - use semantic error color with opacity
borderColor: `${colors.error}${Math.round(opacity.medium * 255).toString(16)}`;
// Or create a utility function:
// borderColor: withOpacity(colors.error, opacity.medium)
```

### Step 15: Retrofit Button.tsx

**Current hardcoded values**:

```typescript
// ❌ Hardcoded
primary: { color: '#FFFFFF' },
color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
```

**Refactored using tokens**:

```typescript
// ✅ Using tokens - add to ThemeColors
// In ThemeContext.tsx, add:
textOnPrimary: '#FFFFFF',  // Text color on primary background
textOnDark: '#FFFFFF',
textOnLight: '#0A0A0A',

// In Button.tsx:
primary: { color: colors.textOnPrimary },
color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary}
```

### Step 16: Retrofit Navigation Components

**WebHeader.tsx hardcoded values**:

```typescript
// ❌ Hardcoded
maxWidth: 1200,
height: 64,
minWidth: 120,
```

**Refactored using tokens**:

```typescript
// ✅ Using tokens - add layout tokens
// In constants/tokens/layout.ts:
export const layout = {
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1200,
    '2xl': 1400,
  },
  headerHeight: {
    mobile: 56,
    desktop: 64,
  },
  sidebarWidth: {
    collapsed: 64,
    expanded: 280,
  },
  touchTarget: {
    min: 44,
    recommended: 48,
  },
};

// In WebHeader.tsx:
import { layout } from '@/constants/tokens';

maxWidth: layout.maxWidth.xl,
height: layout.headerHeight.desktop,
```

### Step 17: Create Color Utility Functions

**File**: `utils/colors.ts` (new file)

```typescript
/**
 * Apply opacity to a hex color
 * @param hexColor - Hex color string (e.g., '#DC2626')
 * @param opacity - Opacity value between 0 and 1
 * @returns rgba string
 */
export function withOpacity(hexColor: string, opacity: number): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get contrasting text color (black or white) for a background
 * @param hexColor - Background hex color
 * @returns '#FFFFFF' or '#000000'
 */
export function getContrastText(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

### Step 18: Retrofit Auth Screens

**Common patterns to fix in login.tsx, signup.tsx, forgot-password.tsx**:

```typescript
// ❌ Hardcoded dimensions
maxWidth: 440,
width: 80,
height: 80,
borderRadius: 48,

// ✅ Using tokens
import { layout, spacing, borderRadius } from '@/constants/tokens';

maxWidth: layout.maxWidth.sm,  // or create authFormMaxWidth token
// For logo:
width: spacing[20],  // 80px
height: spacing[20],
borderRadius: borderRadius.xl,  // or spacing[12] for 48px
```

### Step 19: Add Icon Size Tokens

**File**: `constants/tokens/iconSizes.ts` (new file)

```typescript
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export type IconSize = keyof typeof iconSizes;
```

**Usage across codebase**:

```typescript
// ❌ Hardcoded
<Ionicons name="home" size={20} />
<Ionicons name="menu" size={24} />

// ✅ Using tokens
import { iconSizes } from '@/constants/tokens';

<Ionicons name="home" size={iconSizes.md} />
<Ionicons name="menu" size={iconSizes.lg} />
```

### Step 20: Retrofit Complete - Verification Checklist

After retrofitting, verify NO hardcoded values remain:

**Search patterns to find remaining hardcoded values**:

```bash
# Find hardcoded hex colors
grep -r "#[0-9A-Fa-f]\{6\}" --include="*.tsx" --include="*.ts" app/ components/

# Find hardcoded rgba values
grep -r "rgba(" --include="*.tsx" --include="*.ts" app/ components/

# Find hardcoded numeric dimensions (potential issues)
grep -r "width: [0-9]" --include="*.tsx" --include="*.ts" app/ components/
grep -r "height: [0-9]" --include="*.tsx" --include="*.ts" app/ components/
grep -r "size={[0-9]" --include="*.tsx" --include="*.ts" app/ components/
```

**Allowed exceptions**:

- `flex: 1` - Standard flex value
- `opacity: 0.x` - Should use opacity tokens, but inline is acceptable for one-offs
- `zIndex` values - Often need to be explicit
- SVG/Image intrinsic dimensions

---

## Migration Notes

### Updating Existing Screens

When updating existing screens to use the design system:

1. Replace inline styles with token values
2. Replace `<Text>` with typography components
3. Replace manual spacing with `<Stack>` and `<Spacer>`
4. Use `<Icon>` component instead of direct Ionicons usage
5. Ensure all interactive elements meet touch target requirements
6. Replace hardcoded colors with semantic tokens
7. Replace hardcoded dimensions with layout/spacing tokens
8. Use `withOpacity()` utility instead of inline rgba

### Backwards Compatibility

The existing `constants/theme.ts` exports will continue to work. New tokens are additive and existing components will be enhanced, not replaced.

### Retrofit Priority Order

1. **High Priority** (user-facing, frequently used):
   - Button.tsx (hardcoded white)
   - home.tsx (multiple hardcoded colors)
   - profile.tsx (multiple hardcoded values)

2. **Medium Priority** (navigation, layout):
   - WebHeader.tsx
   - MobileHeader.tsx
   - MobileDrawer.tsx

3. **Lower Priority** (auth screens, less frequent):
   - login.tsx
   - signup.tsx
   - forgot-password.tsx
