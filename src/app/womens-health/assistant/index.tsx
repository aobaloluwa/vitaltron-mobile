import React, { useState } from 'react';
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
import { askWomensHealthAi } from '../../../services/womensHealth';
import { WomensHealthHeader } from '../../../components/womens-health/WomensHealthHeader';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  emergencyWarning?: string;
  suggestedQuestions?: string[];
}

export default function WomensHealthAssistantScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'AI',
      text: 'Hello! I am your Women’s Health AI Companion. How can I help you understand your cycle, pregnancy milestones, or wellness trends today?',
      suggestedQuestions: [
        'How does stress affect cycle duration?',
        'What are the signs of peak ovulation?',
        'How many kicks should I feel in a session?',
      ],
    },
  ]);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askWomensHealthAi(q);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'AI',
        text: res.answer,
        emergencyWarning: res.emergencyWarning,
        suggestedQuestions: res.suggestedQuestions,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'AI',
          text: 'I had trouble processing that request. Please ensure you are connected to the network.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WomensHealthHeader title="AI Health Companion" subtitle="Educational Insights & Guidance" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[styles.msgWrapper, m.sender === 'USER' ? styles.userAlign : styles.aiAlign]}
          >
            <View
              style={[
                styles.msgBubble,
                m.sender === 'USER' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {m.emergencyWarning ? (
                <View style={styles.urgentBanner}>
                  <Ionicons name="warning" size={18} color="#DC2626" />
                  <Text style={styles.urgentText}>{m.emergencyWarning}</Text>
                </View>
              ) : null}

              <Text style={m.sender === 'USER' ? styles.userText : styles.aiText}>
                {m.text}
              </Text>
            </View>

            {m.suggestedQuestions?.length ? (
              <View style={styles.suggestedContainer}>
                {m.suggestedQuestions.map((sq, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.sqPill}
                    onPress={() => void handleSend(sq)}
                  >
                    <Text style={styles.sqText}>{sq}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ))}

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
        ) : null}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your cycle, symptoms, pregnancy..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => void handleSend()}
        />
        <Pressable style={styles.sendBtn} onPress={() => void handleSend()}>
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    msgWrapper: {
      marginVertical: 6,
    },
    userAlign: {
      alignItems: 'flex-end',
    },
    aiAlign: {
      alignItems: 'flex-start',
    },
    msgBubble: {
      maxWidth: '85%',
      borderRadius: 18,
      padding: 14,
    },
    userBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    aiBubble: {
      backgroundColor: colors.white,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.softBackground,
    },
    userText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    aiText: {
      color: colors.darkText,
      fontSize: 14,
      lineHeight: 20,
    },
    urgentBanner: {
      backgroundColor: '#FEF2F2',
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
    urgentText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#991B1B',
      lineHeight: 16,
    },
    suggestedContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    sqPill: {
      backgroundColor: colors.softBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    sqText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    inputArea: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.softBackground,
      gap: 10,
    },
    input: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.darkText,
      height: 46,
    },
    sendBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
