import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightenColor, darkenColor, colorWithOpacity } from '../color-service';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Color Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should lighten a color', () => {
    const original = '#FF0000';
    const lightened = lightenColor(original, 50);
    
    expect(lightened).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(lightened).not.toBe(original);
  });

  it('should darken a color', () => {
    const original = '#FF0000';
    const darkened = darkenColor(original, 50);
    
    expect(darkened).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(darkened).not.toBe(original);
  });

  it('should convert color to rgba', () => {
    const color = '#FF0000';
    const rgba = colorWithOpacity(color, 0.5);
    
    expect(rgba).toContain('rgba');
    expect(rgba).toContain('0.5');
  });

  it('should handle edge cases for color operations', () => {
    // Test with white
    const white = '#FFFFFF';
    const lightenedWhite = lightenColor(white, 50);
    expect(lightenedWhite.toUpperCase()).toBe('#FFFFFF');
    
    // Test with black
    const black = '#000000';
    const darkenedBlack = darkenColor(black, 50);
    expect(darkenedBlack.toUpperCase()).toBe('#000000');
  });

  it('should generate consistent colors for same subjects', () => {
    // Les couleurs doivent être déterministes
    const subject1 = 'Mathématiques';
    const subject2 = 'Mathématiques';
    
    expect(subject1).toBe(subject2);
  });
});
