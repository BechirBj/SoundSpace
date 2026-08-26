export const Colors = {
  // Dark OLED primary surface background
  background: '#051424',
  surface: '#051424',
  surfaceDim: '#051424',
  surfaceBright: '#2c3a4c',

  // Surface container tiers for depth & elevation
  surfaceContainerLowest: '#010f1f',
  surfaceContainerLow: '#0d1c2d',
  surfaceContainer: '#122131',
  surfaceContainerHigh: '#1c2b3c',
  surfaceContainerHighest: '#273647',
  surfaceVariant: '#273647',

  // High contrast text & typography
  onSurface: '#d4e4fa',
  onSurfaceVariant: '#cbc3d7',
  onBackground: '#d4e4fa',
  inverseSurface: '#d4e4fa',
  inverseOnSurface: '#233143',

  // Borders & outlines
  outline: '#958ea0',
  outlineVariant: '#494454',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderGlow: 'rgba(208, 188, 255, 0.25)',

  // Electric Violet / Lavender primary accents
  primary: '#d0bcff',
  primaryFixed: '#e9ddff',
  primaryFixedDim: '#d0bcff',
  primaryContainer: '#a078ff',
  onPrimary: '#3c0091',
  onPrimaryContainer: '#340080',
  onPrimaryFixed: '#23005c',
  onPrimaryFixedVariant: '#5516be',
  inversePrimary: '#6d3bd7',
  surfaceTint: '#d0bcff',

  // Secondary slate/grey accents
  secondary: '#c8c6c8',
  secondaryContainer: '#474649',
  onSecondary: '#303032',
  onSecondaryContainer: '#b7b4b7',
  secondaryFixed: '#e5e1e4',
  secondaryFixedDim: '#c8c6c8',
  onSecondaryFixed: '#1b1b1d',
  onSecondaryFixedVariant: '#474649',

  // Tertiary
  tertiary: '#c8c5cb',
  tertiaryContainer: '#919095',
  onTertiary: '#303034',
  onTertiaryContainer: '#29292d',
  tertiaryFixed: '#e4e1e7',
  tertiaryFixedDim: '#c8c5cb',
  onTertiaryFixed: '#1b1b1f',
  onTertiaryFixedVariant: '#47464b',

  // Error
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Glass & Overlays
  glassBackground: 'rgba(18, 33, 49, 0.72)',
  glassBackgroundHeavy: 'rgba(13, 28, 45, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glowShadow: 'rgba(208, 188, 255, 0.45)',
  heroGradientStart: 'rgba(208, 188, 255, 0.18)',
  heroGradientEnd: 'rgba(5, 20, 36, 1)',
};

export type ThemeColors = typeof Colors;
