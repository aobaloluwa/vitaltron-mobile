import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface Props {
  text?: string;
  isUrgent?: boolean;
}

export const SafetyDisclaimerBanner: React.FC<Props> = ({
  text = 'This tool provides general educational information and tracking insights. Always consult your qualified healthcare provider for clinical medical advice or urgent symptoms.',
  isUrgent = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors, isUrgent);

  return (
    <View style={styles.container}>
      <Ionicons
        name={isUrgent ? 'warning' : 'information-circle-outline'}
        size={20}
        color={isUrgent ? '#DC2626' : colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const createStyles = (colors: any, isUrgent: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isUrgent ? '#FEF2F2' : colors.softBackground,
      borderRadius: 14,
      padding: 12,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: isUrgent ? '#FCA5A5' : colors.softBackground,
    },
    icon: {
      marginRight: 10,
    },
    text: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: isUrgent ? '#991B1B' : colors.darkText,
      lineHeight: 17,
    },
  });
