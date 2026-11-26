import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { getWomensHealthArticles } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';
import { SafetyDisclaimerBanner } from '../../../components/womens-health/SafetyDisclaimerBanner';

const CATEGORIES = [
  'ALL',
  'MENSTRUATION',
  'OVULATION_FERTILITY',
  'PREGNANCY',
  'POSTPARTUM',
  'MENOPAUSE',
  'CONTRACEPTION',
  'SEXUAL_HEALTH',
  'GENERAL_WELLNESS',
];

export default function EducationCenterScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const cat = selectedCat === 'ALL' ? undefined : selectedCat;
      const res = await getWomensHealthArticles(cat, searchQuery);
      setArticles(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, [selectedCat]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="Education Center" subtitle="Medically Reviewed Resources" />

      <View style={styles.headerArea}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search health topics, hormones, ultrasound..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => void loadArticles()}
          />
        </View>

        {/* Categories Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.catPill, selectedCat === cat && styles.catPillActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.catText, selectedCat === cat && styles.catTextActive]}>
                {cat.replace('_', ' ')}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : articles.length === 0 ? (
          <Text style={styles.emptyText}>No articles found for selected category.</Text>
        ) : (
          articles.map((item) => (
            <Pressable
              key={item.id}
              style={styles.articleCard}
              onPress={() => setSelectedArticle(item)}
            >
              <View style={styles.cardTagRow}>
                <Text style={styles.catTag}>{item.category.replace('_', ' ')}</Text>
                <Text style={styles.readTime}>📖 {item.readTimeMinutes} min read</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>

              <View style={styles.authorBadgeRow}>
                <Text style={styles.authorText}>✍️ {item.authorName}</Text>
              </View>

              <View style={styles.reviewerBox}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.reviewerText}>
                  Medically Reviewed by {item.reviewerName} ({item.reviewerTitle})
                </Text>
              </View>

              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Read Full Article ›</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Full Article Reader Modal */}
      <Modal visible={!!selectedArticle} transparent animationType="slide">
        <SafeAreaView style={styles.readerModalOverlay} edges={['top', 'bottom']}>
          <View style={styles.readerHeader}>
            <Pressable
              style={styles.closeBtn}
              onPress={() => setSelectedArticle(null)}
            >
              <Ionicons name="close" size={24} color={colors.darkText} />
            </Pressable>
            <Text style={styles.readerCategoryTag}>
              {selectedArticle?.category?.replace('_', ' ')}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          {selectedArticle ? (
            <ScrollView
              contentContainerStyle={styles.readerContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.readerTitle}>{selectedArticle.title}</Text>

              {/* Credentials & Medical Review Box */}
              <View style={styles.credentialsCard}>
                <View style={styles.credRow}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                  <View style={styles.credInfo}>
                    <Text style={styles.credRole}>Author / Specialist</Text>
                    <Text style={styles.credName}>{selectedArticle.authorName}</Text>
                  </View>
                </View>

                <View style={styles.credDivider} />

                <View style={styles.credRow}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                  <View style={styles.credInfo}>
                    <Text style={styles.credRole}>Medically Reviewed By</Text>
                    <Text style={styles.credName}>
                      {selectedArticle.reviewerName} • {selectedArticle.reviewerTitle}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Read Time & Meta */}
              <View style={styles.metaPillRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>📖 {selectedArticle.readTimeMinutes} Min Read</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>
                    📅 Reviewed {new Date(selectedArticle.lastReviewedAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Full Article Text Body */}
              <View style={styles.bodyWrapper}>
                {selectedArticle.content ? (
                  selectedArticle.content.split('\n\n').map((paragraph: string, idx: number) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <Text key={idx} style={styles.heading2}>
                          {paragraph.replace('## ', '')}
                        </Text>
                      );
                    }
                    if (paragraph.startsWith('* ')) {
                      return (
                        <View key={idx} style={styles.bulletRow}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{paragraph.replace('* ', '')}</Text>
                        </View>
                      );
                    }
                    return (
                      <Text key={idx} style={styles.paragraphText}>
                        {paragraph}
                      </Text>
                    );
                  })
                ) : (
                  <Text style={styles.paragraphText}>{selectedArticle.summary}</Text>
                )}
              </View>

              <SafetyDisclaimerBanner text="This educational material is strictly for general informational purposes and does not replace individual clinical evaluation or medical diagnosis by a qualified physician." />
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerArea: {
      paddingHorizontal: 20,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.softBackground,
      marginBottom: 10,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: colors.darkText,
    },
    catScroll: {
      marginBottom: 12,
    },
    catPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      marginRight: 8,
    },
    catPillActive: {
      backgroundColor: colors.primary,
    },
    catText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.darkText,
    },
    catTextActive: {
      color: colors.white,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 40,
    },
    articleCard: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
      shadowColor: colors.darkText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTagRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    catTag: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    readTime: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
    },
    summary: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: 4,
    },
    authorBadgeRow: {
      marginTop: 8,
    },
    authorText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
    },
    reviewerBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 8,
      marginTop: 8,
      gap: 6,
    },
    reviewerText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
      flex: 1,
    },
    readMoreRow: {
      marginTop: 10,
      alignItems: 'flex-end',
    },
    readMoreText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    readerModalOverlay: {
      flex: 1,
      backgroundColor: colors.background,
    },
    readerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.softBackground,
      backgroundColor: colors.white,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    readerCategoryTag: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    readerContent: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: Platform.OS === 'ios' ? 115 : 32,
    },
    readerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.darkText,
      lineHeight: 28,
      marginBottom: 16,
    },
    credentialsCard: {
      backgroundColor: colors.white,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.softBackground,
      marginBottom: 12,
    },
    credRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    credInfo: {
      flex: 1,
    },
    credRole: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    credName: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
      marginTop: 2,
    },
    credDivider: {
      height: 1,
      backgroundColor: colors.softBackground,
      marginVertical: 10,
    },
    metaPillRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    metaPill: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    metaPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    bodyWrapper: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.softBackground,
      marginBottom: 16,
    },
    heading2: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.darkText,
      marginTop: 14,
      marginBottom: 8,
    },
    paragraphText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.darkText,
      lineHeight: 22,
      marginBottom: 12,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 8,
      paddingLeft: 4,
    },
    bulletDot: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary,
      lineHeight: 20,
    },
    bulletText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: colors.darkText,
      lineHeight: 20,
    },
  });
