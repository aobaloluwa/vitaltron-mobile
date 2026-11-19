import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

const CATEGORIES = [
  'ALL',
  'MENSTRUATION',
  'OVULATION_FERTILITY',
  'PREGNANCY',
  'POSTPARTUM',
  'MENOPAUSE',
  'CONTRACEPTION',
  'SEXUAL_HEALTH',
];

export default function EducationCenterScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
            placeholder="Search health topics, hormones..."
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
            <View key={item.id} style={styles.articleCard}>
              <View style={styles.cardTagRow}>
                <Text style={styles.catTag}>{item.category}</Text>
                <Text style={styles.readTime}>{item.readTimeMinutes} min read</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>

              <View style={styles.reviewerBox}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.reviewerText}>
                  Reviewed by {item.reviewerName} ({item.reviewerTitle})
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.softBackground,
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
    reviewerBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 8,
      marginTop: 10,
      gap: 6,
    },
    reviewerText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.darkText,
    },
  });
