/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#F97316'; // Orange
const tintColorDark = '#FB923C'; // Lighter Orange

export const Colors = {
  light: {
    text: '#334155', // Slate-700
    background: '#FFF7ED', // Orange-50 (Warm White)
    tint: tintColorLight,
    icon: '#94A3B8', // Slate-400
    tabIconDefault: '#CBD5E1', // Slate-300
    tabIconSelected: tintColorLight,
    primary: '#F97316', // Orange-500
    secondary: '#14B8A6', // Teal-500
    card: '#FFFFFF',
    border: '#FED7AA', // Orange-200
    error: '#EF4444',
  },
  dark: {
    text: '#FFF7ED',
    background: '#1F2937', // Gray-800
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorDark,
    primary: '#FB923C',
    secondary: '#2DD4BF',
    card: '#374151',
    border: '#4B5563',
    error: '#F87171',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
