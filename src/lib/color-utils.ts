/**
 * Utility functions for color comparison and kit clash detection.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Calculates the Euclidean distance between two colors in RGB space.
 * A distance below ~100 usually indicates a significant clash.
 */
export function getColorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

/**
 * Returns true if two colors are too similar to be played against each other.
 */
export function isColorClash(hex1: string, hex2: string): boolean {
  // Threshold of 120 is generally safe for clear distinction
  return getColorDistance(hex1, hex2) < 120;
}
