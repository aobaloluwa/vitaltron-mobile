import React, { useEffect } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import Svg, { Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import { useTheme } from '../../theme';

// Safely import the native module if it's available (Dev Client / EAS Build)
let LiquidGlassNavigationView: any = null;
try {
  if (Platform.OS === 'ios') {
    // Only attempt to load in iOS
    const { LiquidGlassNavigationView: NativeView } = require('../../../modules/liquid-glass-navigation');
    LiquidGlassNavigationView = NativeView;
  }
} catch (e) {
  // Not available in Expo Go or not linked
  console.log("Native Liquid Glass module not available, using JS fallback.");
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FAST_SPRING_CONFIG = {
  damping: 25,
  stiffness: 380,
  mass: 0.5,
};

const TAB_ICON_MAP: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { active: 'home', inactive: 'home-outline', label: 'Home' },
  analytics: { active: 'rose', inactive: 'rose-outline', label: "Women's" },
  scan: { active: 'scan', inactive: 'scan-outline', label: 'Scan' },
  briefs: { active: 'share-social', inactive: 'share-social-outline', label: 'Sharing' },
  profile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

export function FluidGlassTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const isIos = Platform.OS === 'ios';

  // Check if native component is truly available via UIManager to avoid crashes
  const isNativeLiquidGlassAvailable = isIos && LiquidGlassNavigationView && UIManager.getViewManagerConfig('LiquidGlassNavigation') != null;

  const containerPadding = 8;
  const barWidth = Math.min(SCREEN_WIDTH - 32, 500);
  const totalTabs = state?.routes?.length || 5;
  const availableWidth = barWidth - containerPadding * 2;
  const tabWidth = availableWidth / totalTabs;

  const activeIndex = state?.index || 0;

  // JS Fallback Animation Value
  const translateX = useSharedValue(activeIndex * tabWidth);

  useEffect(() => {
    if (!isNativeLiquidGlassAvailable) {
      translateX.value = withSpring(activeIndex * tabWidth, FAST_SPRING_CONFIG);
    }
  }, [activeIndex, tabWidth, isNativeLiquidGlassAvailable]);

  const switchTab = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalTabs - 1, index));

    if (!isNativeLiquidGlassAvailable) {
      translateX.value = withSpring(clampedIndex * tabWidth, FAST_SPRING_CONFIG);
    }

    const route = state?.routes?.[clampedIndex];
    if (!route) return;
    const isFocused = state.index === clampedIndex;

    if (navigation && typeof navigation.emit === 'function') {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && (!event || !event.defaultPrevented)) {
        if (typeof navigation.navigate === 'function') {
          navigation.navigate(route.name);
        } else {
          router.navigate(route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}` as any);
        }
      }
    } else {
      router.navigate(route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}` as any);
    }
  };

  const onPanGesture = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    if (isNativeLiquidGlassAvailable) return;

    const touchX = event.nativeEvent.x - containerPadding;
    const targetIdx = Math.max(0, Math.min(totalTabs - 1, Math.floor(touchX / tabWidth)));
    const stateVal = event.nativeEvent.state;
    const translationX = event.nativeEvent.translationX;

    if (stateVal === State.ACTIVE && Math.abs(translationX) > 4) {
      const maxTranslate = (totalTabs - 1) * tabWidth;
      const rawTranslate = touchX - tabWidth / 2;
      translateX.value = Math.max(0, Math.min(maxTranslate, rawTranslate));
    }

    if (stateVal === State.END || stateVal === State.CANCELLED || stateVal === State.FAILED) {
      translateX.value = withSpring(targetIdx * tabWidth, FAST_SPRING_CONFIG);
      runOnJS(switchTab)(targetIdx);
    }
  };

  const animatedBubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const bottomMargin = Math.max(insets.bottom, 10);

  // Precise dimensions matching the native pill shape exactly
  const lensWidth = tabWidth - 12;
  const lensHeight = 58;
  const lensRadius = lensHeight / 2;

  // --- RENDER TABS CONTENT ---
  const renderTabsRow = () => (
    <View style={styles.tabsRow}>
      {state?.routes?.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const meta = TAB_ICON_MAP[route.name] || {
          active: 'ellipse',
          inactive: 'ellipse-outline',
          label: route.name,
        };

        return (
          <Pressable
            key={route.key}
            // Strict width applied directly to avoid any flex discrepancy
            // that causes text strings (like "Women's") to shift the exact center geometric bounds.
            style={[styles.tabCell, { width: tabWidth }]}
            onPress={() => switchTab(index)}
            hitSlop={8}
          >
            <Ionicons
              name={isFocused ? meta.active : meta.inactive}
              size={24}
              color={isFocused ? colors.primary : '#9CA3AF'}
              style={isFocused && styles.activeIconDropShadow}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? colors.primary : '#9CA3AF' },
                isFocused && styles.tabLabelActive,
              ]}
              numberOfLines={1}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (isNativeLiquidGlassAvailable) {
    return (
      <View style={[styles.outerWrapper, { bottom: bottomMargin }]} pointerEvents="box-none">
        <LiquidGlassNavigationView
          style={[styles.floatingBarContainer, { width: barWidth, paddingHorizontal: 0 }]}
          activeIndex={activeIndex}
          tabCount={totalTabs}
          colorScheme={isDarkMode ? 'dark' : 'light'}
        >
          {renderTabsRow()}
        </LiquidGlassNavigationView>
      </View>
    );
  }

  // JS FALLBACK (Older iOS without module & Expo Go & Android)
  return (
    <View style={[styles.outerWrapper, { bottom: bottomMargin }]} pointerEvents="box-none">
      <GestureHandlerRootView>
        <PanGestureHandler
          onGestureEvent={onPanGesture}
          onHandlerStateChange={onPanGesture}
          activeOffsetX={[-8, 8]}
        >
          <Animated.View style={[styles.floatingBarContainer, { width: barWidth }]}>
            {isIos ? (
              <GlassView
                glassEffectStyle="regular"
                colorScheme={isDarkMode ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View
                style={[
                  styles.androidBackdrop,
                  { backgroundColor: isDarkMode ? 'rgba(26,26,26,0.92)' : 'rgba(255,255,255,0.92)' },
                ]}
              />
            )}

            <View style={styles.topGlossHighlight} />

            <Animated.View
              style={[
                styles.liquidLensBubble,
                {
                  width: lensWidth,
                  height: lensHeight,
                  borderRadius: lensRadius,
                  left: 14, // Exact offset alignment: 8px container padding + 6px pill inset
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.35)',
                },
                animatedBubbleStyle,
              ]}
              pointerEvents="none"
            >
              {isIos ? (
                <GlassView
                  glassEffectStyle="clear"
                  colorScheme={isDarkMode ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}

              <Svg width={lensWidth} height={lensHeight} style={StyleSheet.absoluteFill}>
                <Defs>
                  <SvgGradient id="pureDynamicGlassRefraction" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                    <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.0" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.25" />
                  </SvgGradient>
                </Defs>
                <Rect
                  x={1}
                  y={1}
                  width={lensWidth - 2}
                  height={lensHeight - 2}
                  rx={(lensHeight - 2) / 2}
                  ry={(lensHeight - 2) / 2}
                  fill="url(#pureDynamicGlassRefraction)"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1}
                />
              </Svg>
            </Animated.View>

            {renderTabsRow()}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  floatingBarContainer: {
    height: 74,
    borderRadius: 37,
    overflow: 'hidden', // Required for JS fallback
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 37,
  },
  topGlossHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  liquidLensBubble: {
    position: 'absolute',
    top: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 8,
  },
  tabCell: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  activeIconDropShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  }
});
