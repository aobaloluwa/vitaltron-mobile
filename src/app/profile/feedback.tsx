import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AppTextInput } from '../../components/ui/AppTextInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme';

export default function FeedbackScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [category, setCategory] = useState('Feature Request');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isDesktopOrTablet = windowWidth >= 768;

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('Required', 'Please enter your feedback comments before submitting.');
      return;
    }
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Thank You!', 'Your feedback has been received. Our engineering team appreciates your input.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktopOrTablet && styles.scrollContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.mainWrapper, { maxWidth: isDesktopOrTablet ? 600 : '100%' }]}>
            {/* Header Bar */}
            <View style={styles.headerBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
                <Ionicons name="arrow-back" size={22} color={colors.darkText} />
              </Pressable>
              <Text style={styles.headerTitle}>Send Feedback</Text>
              <AppLogo size="small" showText={false} />
            </View>

            {/* Banner */}
            <View style={styles.heroBox}>
              <Ionicons name="chatbox-ellipses" size={32} color={colors.primary} />
              <Text style={styles.heroTitle}>Help Us Improve Vitaltron</Text>
              <Text style={styles.heroSub}>
                Share feature requests, report AI document extraction errors, or provide general app feedback.
              </Text>
            </View>

            {/* Responsive Categories */}
            <Text style={styles.inputLabel}>Select Category:</Text>
            <View style={styles.categoryRow}>
              {['Feature Request', 'Bug Report', 'Record Issue'].map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.catPill, category === cat && styles.catPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Responsive Multiline Text Area */}
            <View style={styles.inputWrapper}>
              <AppTextInput
                label="Your Feedback / Comments"
                placeholder="Tell us what you think or describe the issue..."
                value={feedback}
                onChangeText={setFeedback}
                multiline={true}
                numberOfLines={6}
                style={styles.textAreaField}
              />
            </View>

            <PrimaryButton
              title="Submit Feedback"
              onPress={handleSubmit}
              loading={submitting}
              variant="primary"
              style={{ marginTop: 16 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  scrollContentDesktop: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  heroBox: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 420,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  catPill: {
    flex: 1,
    minWidth: 110,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkText,
  },
  catTextActive: {
    color: colors.white,
  },
  inputWrapper: {
    width: '100%',
  },
  textAreaField: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 12,
    lineHeight: 20,
  },
});
