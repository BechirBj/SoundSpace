import { TextStyle, Platform } from 'react-native';

const monoFont = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

export const Typography: Record<string, TextStyle> = {
  displayLg: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  titleSm: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  metadataSm: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelCaps: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  captionXs: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
};
