import React, { useEffect } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from 'react-native-gesture-handler';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const containerPadding = 8;
  const barWidth = Math.min(SCREEN_WIDTH - 32, 500);
  const totalTabs = state.routes.length;
  const availableWidth = barWidth - containerPadding * 2;
  const tabWidth = availableWidth / totalTabs;

  const activeIndex = state.index;
  const translateX = useSharedValue(activeIndex * tabWidth);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  useEffect(() => {
    translateX.value = withSpring(activeIndex * tabWidth, {
      damping: 18,
      stiffness: 180,
    });
  }, [activeIndex, tabWidth]);

  const switchTab = (index: number) => {
    const route = state.routes[index];
    if (!route) return;
    const isFocused = state.index === index;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const onPanGesture = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    const touchX = event.nativeEvent.x - containerPadding;
    const targetIdx = Math.max(0, Math.min(totalTabs - 1, Math.floor(touchX / tabWidth)));

    translateX.value = touchX - tabWidth / 2;
    scaleX.value = withSpring(1.18, { damping: 12 });
    scaleY.value = withSpring(0.92, { damping: 12 });

    if (event.nativeEvent.state === 5) {
      // Gesture END / CANCELLED
      scaleX.value = withSpring(1, { damping: 15 });
      scaleY.value = withSpring(1, { damping: 15 });

      translateX.value = withSpring(targetIdx * tabWidth, {
        damping: 18,
        stiffness: 180,
      });

      runOnJS(switchTab)(targetIdx);
    }
  };

  const animatedBubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scaleX: scaleX.value },
        { scaleY: scaleY.value },
      ],
    };
  });

  const bottomMargin = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.outerWrapper, { bottom: bottomMargin }]} pointerEvents="box-none">
      <GestureHandlerRootView>
        <PanGestureHandler onGestureEvent={onPanGesture} onHandlerStateChange={onPanGesture}>
          <Animated.View style={[styles.floatingBarContainer, { width: barWidth }]}>
            {/* Glass / Translucent Backdrop */}
            {isIos ? (
              <GlassView
                glassEffectStyle="regular"
                colorScheme={isDarkMode ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[styles.androidBackdrop, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]} />
            )}

            {/* Fluid Liquid Glass Lens Active Bubble Indicator */}
            <Animated.View
              style={[
                styles.liquidLensBubble,
                { width: tabWidth, height: 48, borderRadius: 24 },
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
              ) : (
                <View style={[styles.androidBubbleFill, { backgroundColor: colors.softBackground }]} />
              )}

              {/* Chromatic Liquid Prism Border Gradient */}
              <Svg width={tabWidth} height={48} style={StyleSheet.absoluteFill}>
                <Defs>
                  <SvgGradient id="liquidPrism" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                    <Stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
                  </SvgGradient>
                </Defs>
                <Rect
                  x={1}
                  y={1}
                  width={tabWidth - 2}
                  height={46}
                  rx={23}
                  ry={23}
                  fill="none"
                  stroke="url(#liquidPrism)"
                  strokeWidth={2}
                />
              </Svg>
            </Animated.View>

            {/* Tab Items */}
            <View style={styles.tabsRow}>
              {state.routes.map((route: any, index: number) => {
                const isFocused = state.index === index;
                const meta = TAB_ICON_MAP[route.name] || {
                  active: 'ellipse',
                  inactive: 'ellipse-outline',
                  label: route.name,
                };

                return (
                  <Pressable
                    key={route.key}
                    style={styles.tabCell}
                    onPress={() => switchTab(index)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isFocused ? meta.active : meta.inactive}
                      size={22}
                      color={isFocused ? colors.primary : '#9CA3AF'}
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
    height: 64,
    borderRadius: 36,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFill,
    borderRadius: 36,
  },
  liquidLensBubble: {
    position: 'absolute',
    top: 8,
    left: 8,
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  androidBubbleFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tabCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
