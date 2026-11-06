import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLogo } from '../components/ui/AppLogo';
import { HealthPassportIllustration } from '../components/illustrations/HealthPassportIllustration';
import { AIBriefIllustration } from '../components/illustrations/AIBriefIllustration';
import { SecureSharingIllustration } from '../components/illustrations/SecureSharingIllustration';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@vitaltron/onboarding-completed';

interface SlideItem {
  id: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

const slides: SlideItem[] = [
  {
    id: '1',
    title: 'Universal Health Identity',
    description:
      'Your medical history, diagnoses, and prescriptions organized in one portable health passport wherever care is needed.',
    illustration: <HealthPassportIllustration />,
  },
  {
    id: '2',
    title: 'Smart AI Clinical Briefs',
    description:
      'Photograph paper reports or upload PDFs. AI extracts key medical details and produces instant summaries for clinicians.',
    illustration: <AIBriefIllustration />,
  },
  {
    id: '3',
    title: 'Controlled & Secure Sharing',
    description:
      'Grant access to trusted healthcare providers using secure temporary links or QR codes with full expiry and revocation controls.',
    illustration: <SecureSharingIllustration />,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Ignore storage error
    }
    router.replace('/welcome');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      void handleFinishOnboarding();
    }
  };

  const handleSkip = () => {
    void handleFinishOnboarding();
  };

  const renderSlide = ({ item }: { item: SlideItem }) => (
    <View style={styles.slideContainer}>
      <View style={styles.illustrationWrapper}>{item.illustration}</View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Bar with Logo and Skip Action */}
      <View style={styles.topBar}>
        <AppLogo size="small" showText={true} />
        {currentIndex < slides.length - 1 ? (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* Main Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / SCREEN_WIDTH);
              setCurrentIndex(index);
            },
          }
        )}
        scrollEventThrottle={16}
      />

      {/* Bottom Control Section */}
      <View style={styles.bottomSection}>
        {/* Animated Pagination Dots */}
        <View style={styles.paginationContainer}>
          {slides.map((_, idx) => {
            const inputRange = [
              (idx - 1) * SCREEN_WIDTH,
              idx * SCREEN_WIDTH,
              (idx + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 28, 10],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor:
                      idx === currentIndex ? colors.primary : colors.secondary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    color: colors.darkText,
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.65,
  },
  skipPlaceholder: {
    width: 48,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  illustrationWrapper: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 15,
    color: colors.darkText,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.72,
  },
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
});
