import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  const [category, setCategory] = useState('Feature Request');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Thank You!', 'Your feedback has been received. Our medical engineering team appreciates your input.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

          {/* Categories */}
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

          {/* Text Area Input */}
          <AppTextInput
            label="Your Feedback"
            placeholder="Tell us what you think or describe the issue..."
            value={feedback}
            onChangeText={setFeedback}
            multiline={true}
            numberOfLines={5}
            style={{ height: 120, textAlignVertical: 'top', paddingTop: 12 }}
          />

          <PrimaryButton
            title="Submit Feedback"
            onPress={handleSubmit}
            loading={submitting}
            variant="primary"
            style={{ marginTop: 12 }}
          />
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
    paddingBottom: 32,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.softBackground,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    marginTop: 8,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  catPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.softBackground,
    alignItems: 'center',
  },
  catPillActive: {
    backgroundColor: colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkText,
  },
  catTextActive: {
    color: colors.white,
  },
});
