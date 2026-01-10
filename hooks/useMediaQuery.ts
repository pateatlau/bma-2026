import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export function useMediaQuery() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription.remove();
  }, []);

  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const isWideScreen = dimensions.width >= 768;

  // Use horizontal nav on web with wide screens, drawer on mobile or narrow web
  const useHorizontalNav = isWeb && isWideScreen;

  return {
    width: dimensions.width,
    height: dimensions.height,
    isWeb,
    isMobile,
    isWideScreen,
    useHorizontalNav,
  };
}
