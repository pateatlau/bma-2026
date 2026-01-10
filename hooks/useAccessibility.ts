/**
 * useAccessibility Hook
 *
 * Provides accessibility-related props and utilities for components.
 * Helps ensure components are properly accessible across platforms.
 */

import { useMemo } from 'react';
import { AccessibilityProps, Platform } from 'react-native';

/**
 * Options for generating accessibility props
 */
export interface AccessibilityOptions {
  /** The accessible label (read by screen readers) */
  label?: string;
  /** Additional hint for screen readers */
  hint?: string;
  /** The role of the element */
  role?: AccessibilityProps['accessibilityRole'];
  /** Current state for toggleable elements */
  state?: {
    checked?: boolean;
    selected?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  /** Value information for sliders, progress, etc. */
  value?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  /** Whether this element should be focusable */
  focusable?: boolean;
  /** Live region behavior */
  liveRegion?: 'none' | 'polite' | 'assertive';
}

/**
 * Hook that generates accessibility props for a component
 *
 * @param options - Accessibility configuration options
 * @returns AccessibilityProps to spread onto a component
 *
 * @example
 * const a11yProps = useAccessibility({
 *   label: 'Submit form',
 *   role: 'button',
 *   hint: 'Double tap to submit your changes',
 * });
 *
 * return <TouchableOpacity {...a11yProps}>...</TouchableOpacity>;
 *
 * @example
 * // Toggle button
 * const a11yProps = useAccessibility({
 *   label: 'Dark mode',
 *   role: 'switch',
 *   state: { checked: isDarkMode },
 * });
 */
export function useAccessibility(options: AccessibilityOptions): AccessibilityProps {
  const {
    label,
    hint,
    role,
    state,
    value,
    focusable = true,
    liveRegion = 'none',
  } = options;

  return useMemo(() => {
    const props: AccessibilityProps = {
      accessible: focusable,
    };

    if (label) {
      props.accessibilityLabel = label;
    }

    if (hint) {
      props.accessibilityHint = hint;
    }

    if (role) {
      props.accessibilityRole = role;
    }

    if (state) {
      props.accessibilityState = {
        checked: state.checked,
        selected: state.selected,
        disabled: state.disabled,
        expanded: state.expanded,
        busy: state.busy,
      };
    }

    if (value) {
      props.accessibilityValue = {
        min: value.min,
        max: value.max,
        now: value.now,
        text: value.text,
      };
    }

    if (liveRegion !== 'none') {
      props.accessibilityLiveRegion = liveRegion;
    }

    return props;
  }, [label, hint, role, state, value, focusable, liveRegion]);
}

/**
 * Hook for button accessibility
 *
 * @param label - The button label
 * @param options - Additional options
 * @returns AccessibilityProps for a button
 *
 * @example
 * const a11yProps = useButtonAccessibility('Save changes', { disabled: isLoading });
 */
export function useButtonAccessibility(
  label: string,
  options?: { disabled?: boolean; hint?: string }
): AccessibilityProps {
  return useAccessibility({
    label,
    hint: options?.hint,
    role: 'button',
    state: options?.disabled ? { disabled: true } : undefined,
  });
}

/**
 * Hook for link accessibility
 *
 * @param label - The link label
 * @param options - Additional options
 * @returns AccessibilityProps for a link
 *
 * @example
 * const a11yProps = useLinkAccessibility('Learn more about our privacy policy');
 */
export function useLinkAccessibility(
  label: string,
  options?: { hint?: string }
): AccessibilityProps {
  return useAccessibility({
    label,
    hint: options?.hint || 'Opens in browser',
    role: 'link',
  });
}

/**
 * Hook for heading accessibility
 *
 * @param label - The heading text (used as label for screen readers)
 * @returns AccessibilityProps for a heading
 *
 * @example
 * const a11yProps = useHeadingAccessibility('Settings');
 */
export function useHeadingAccessibility(label: string): AccessibilityProps {
  return useAccessibility({
    label,
    role: 'header',
  });
}

/**
 * Hook for image accessibility
 *
 * @param description - Description of the image
 * @param isDecorative - If true, image is hidden from screen readers
 * @returns AccessibilityProps for an image
 *
 * @example
 * const a11yProps = useImageAccessibility('Profile photo of John Doe');
 *
 * @example
 * // Decorative image
 * const a11yProps = useImageAccessibility('', true);
 */
export function useImageAccessibility(
  description: string,
  isDecorative = false
): AccessibilityProps {
  return useMemo(() => {
    if (isDecorative) {
      return {
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };
    }

    return {
      accessible: true,
      accessibilityLabel: description,
      accessibilityRole: 'image',
    };
  }, [description, isDecorative]);
}

/**
 * Hook for input field accessibility
 *
 * @param label - The input label
 * @param options - Additional options
 * @returns AccessibilityProps for an input
 *
 * @example
 * const a11yProps = useInputAccessibility('Email address', {
 *   hint: 'Enter your email to receive updates',
 *   error: 'Invalid email format',
 * });
 */
export function useInputAccessibility(
  label: string,
  options?: { hint?: string; error?: string; disabled?: boolean }
): AccessibilityProps {
  return useMemo(() => {
    const fullLabel = options?.error
      ? `${label}, Error: ${options.error}`
      : label;

    return {
      accessible: true,
      accessibilityLabel: fullLabel,
      accessibilityHint: options?.hint,
      accessibilityState: {
        disabled: options?.disabled,
      },
    };
  }, [label, options?.hint, options?.error, options?.disabled]);
}
