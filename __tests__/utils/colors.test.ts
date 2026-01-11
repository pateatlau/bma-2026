import {
  withOpacity,
  getContrastText,
  getLuminance,
  getContrastRatio,
  meetsContrastRequirement,
  hexToRgb,
  rgbToHex,
  lighten,
  darken,
} from '@/utils/colors';

describe('colors utility', () => {
  describe('withOpacity', () => {
    it('adds opacity to hex color', () => {
      const result = withOpacity('#FF0000', 0.5);
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('handles full opacity', () => {
      const result = withOpacity('#00FF00', 1);
      expect(result).toBe('rgba(0, 255, 0, 1)');
    });

    it('handles zero opacity', () => {
      const result = withOpacity('#0000FF', 0);
      expect(result).toBe('rgba(0, 0, 255, 0)');
    });

    it('handles hex without # prefix', () => {
      const result = withOpacity('FF5500', 0.5);
      expect(result).toBe('rgba(255, 85, 0, 0.5)');
    });

    it('handles shorthand hex', () => {
      const result = withOpacity('#FFF', 0.5);
      expect(result).toBe('rgba(255, 255, 255, 0.5)');
    });

    it('clamps opacity to valid range', () => {
      expect(withOpacity('#000', 1.5)).toBe('rgba(0, 0, 0, 1)');
      expect(withOpacity('#000', -0.5)).toBe('rgba(0, 0, 0, 0)');
    });
  });

  describe('hexToRgb', () => {
    it('converts hex to RGB object', () => {
      const result = hexToRgb('#FF5500');
      expect(result).toEqual({ r: 255, g: 85, b: 0 });
    });

    it('handles lowercase hex', () => {
      const result = hexToRgb('#ff5500');
      expect(result).toEqual({ r: 255, g: 85, b: 0 });
    });

    it('handles hex without # prefix', () => {
      const result = hexToRgb('FF5500');
      expect(result).toEqual({ r: 255, g: 85, b: 0 });
    });

    it('handles shorthand hex', () => {
      const result = hexToRgb('#F00');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('rgbToHex', () => {
    it('converts RGB to hex', () => {
      const result = rgbToHex(255, 85, 0);
      expect(result).toBe('#FF5500');
    });

    it('pads single digit values', () => {
      const result = rgbToHex(0, 0, 15);
      expect(result).toBe('#00000F');
    });

    it('clamps values to valid range', () => {
      const result = rgbToHex(300, -10, 128);
      expect(result).toBe('#FF0080');
    });
  });

  describe('getContrastText', () => {
    it('returns white for dark backgrounds', () => {
      expect(getContrastText('#000000')).toBe('#FFFFFF');
      expect(getContrastText('#DC2626')).toBe('#FFFFFF'); // Red
      expect(getContrastText('#1E3A8A')).toBe('#FFFFFF'); // Dark blue
    });

    it('returns black for light backgrounds', () => {
      expect(getContrastText('#FFFFFF')).toBe('#000000');
      expect(getContrastText('#F5F5F5')).toBe('#000000');
      expect(getContrastText('#FEF2F2')).toBe('#000000'); // Light red
    });
  });

  describe('getLuminance', () => {
    it('returns 0 for black', () => {
      expect(getLuminance('#000000')).toBeCloseTo(0, 5);
    });

    it('returns 1 for white', () => {
      expect(getLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    });

    it('returns correct luminance for gray', () => {
      const result = getLuminance('#808080');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('returns 21 for black and white', () => {
      const result = getContrastRatio('#000000', '#FFFFFF');
      expect(result).toBeCloseTo(21, 0);
    });

    it('returns 1 for same colors', () => {
      const result = getContrastRatio('#FF0000', '#FF0000');
      expect(result).toBeCloseTo(1, 5);
    });

    it('returns same ratio regardless of order', () => {
      const ratio1 = getContrastRatio('#000000', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#000000');
      expect(ratio1).toBeCloseTo(ratio2, 5);
    });
  });

  describe('meetsContrastRequirement', () => {
    it('passes AA for black on white', () => {
      expect(meetsContrastRequirement('#000000', '#FFFFFF', 'AA')).toBe(true);
    });

    it('passes AAA for black on white', () => {
      expect(meetsContrastRequirement('#000000', '#FFFFFF', 'AAA')).toBe(true);
    });

    it('has lower requirements for large text', () => {
      // A color combo that might fail normal AA but pass large text AA
      const passesLargeText = meetsContrastRequirement('#777777', '#FFFFFF', 'AA', true);
      const passesNormalText = meetsContrastRequirement('#777777', '#FFFFFF', 'AA', false);
      // Large text should be equal or more permissive
      expect(passesLargeText).toBe(true);
      expect(passesNormalText).toBe(false);
    });
  });

  describe('lighten', () => {
    it('returns white when amount is 1', () => {
      expect(lighten('#000000', 1)).toBe('#FFFFFF');
    });

    it('returns same color when amount is 0', () => {
      expect(lighten('#FF0000', 0)).toBe('#FF0000');
    });

    it('lightens color by amount', () => {
      const result = lighten('#000000', 0.5);
      // Should be approximately middle gray
      expect(result).toBe('#808080');
    });
  });

  describe('darken', () => {
    it('returns black when amount is 1', () => {
      expect(darken('#FFFFFF', 1)).toBe('#000000');
    });

    it('returns same color when amount is 0', () => {
      expect(darken('#FF0000', 0)).toBe('#FF0000');
    });

    it('darkens color by amount', () => {
      const result = darken('#FFFFFF', 0.5);
      // Should be approximately middle gray
      expect(result).toBe('#808080');
    });
  });
});
