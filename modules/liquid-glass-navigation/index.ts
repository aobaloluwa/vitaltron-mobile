import { requireNativeView } from 'expo';
import * as React from 'react';
import { ViewProps } from 'react-native';

export type LiquidGlassNavigationViewProps = {
  activeIndex: number;
  tabCount: number;
  colorScheme?: 'light' | 'dark' | 'system';
} & ViewProps;

export const LiquidGlassNavigationView: React.ComponentType<LiquidGlassNavigationViewProps> =
  requireNativeView('LiquidGlassNavigation');
