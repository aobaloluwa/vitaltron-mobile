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
  const totalTabs = state?.routes?.length || 5;
  const availableWidth = barWidth - containerPadding * 2;
  const tabWidth = availableWidth / totalTabs;

  const activeIndex = state?.index || 0;
  const translateX = useSharedValue(activeIndex * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(activeIndex * tabWidth, {
      damping: 22,
      stiffness: 220,
    });
  }, [activeIndex, tabWidth]);

  const switchTab = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalTabs - 1, index));

    // Force perfect center slot alignment
    translateX.value = withSpring(clampedIndex * tabWidth, {
      damping: 22,
      stiffness: 220,
    });

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
    const touchX = event.nativeEvent.x - containerPadding;
    const targetIdx = Math.max(0, Math.min(totalTabs - 1, Math.floor(touchX / tabWidth)));
    const stateVal = event.nativeEvent.state;
    const translationX = event.nativeEvent.translationX;

    // Only drag follow if user is actively panning (moving finger > 4px)
    if (stateVal === State.ACTIVE && Math.abs(translationX) > 4) {
      const maxTranslate = (totalTabs - 1) * tabWidth;
      const rawTranslate = touchX - tabWidth / 2;
      translateX.value = Math.max(0, Math.min(maxTranslate, rawTranslate));
    }

    // On Gesture release, cancel, or end, ALWAYS snap perfectly to slot center
    if (stateVal === State.END || stateVal === State.CANCELLED || stateVal === State.FAILED) {
      translateX.value = withSpring(targetIdx * tabWidth, {
        damping: 22,
        stiffness: 220,
      });

      runOnJS(switchTab)(targetIdx);
    }
  };

  const animatedBubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const bottomMargin = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.outerWrapper, { bottom: bottomMargin }]} pointerEvents="box-none">
      <GestureHandlerRootView>
        <PanGestureHandler
          onGestureEvent={onPanGesture}
          onHandlerStateChange={onPanGesture}
          activeOffsetX={[-8, 8]}
        >
          <Animated.View style={[styles.floatingBarContainer, { width: barWidth }]}>
            {/* Liquid Glass Dock Backdrop */}
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

            {/* Glossy Top Edge Highlight */}
            <View style={styles.topGlossHighlight} />

            {/* Pure Dynamic Translucent Liquid Glass Lens Oval Capsule */}
            <Animated.View
              style={[
                styles.liquidLensBubble,
                {
                  width: tabWidth,
                  height: 58,
                  borderRadius: 29,
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

              {/* Dynamic Glass Specular Highlight Rim */}
              <Svg width={tabWidth} height={58} style={StyleSheet.absoluteFill}>
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
                  width={tabWidth - 2}
                  height={56}
                  rx={28}
                  ry={28}
                  fill="url(#pureDynamicGlassRefraction)"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1}
                />
              </Svg>
            </Animated.View>

            {/* Tab Items Row */}
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
                    style={styles.tabCell}
                    onPress={() => switchTab(index)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isFocused ? meta.active : meta.inactive}
                      size={24}
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
    height: 74,
    borderRadius: 37,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFill,
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
    left: 8,
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
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
