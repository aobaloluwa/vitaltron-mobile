import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface TimePickerInputProps {
  label?: string;
  value: string; // "09:00 AM"
  onChange: (timeStr: string) => void;
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [showPicker, setShowPicker] = useState(false);

  // Parse time string "09:00 AM" into Date object
  const parseTime = (timeStr: string): Date => {
    const now = new Date();
    if (!timeStr) return now;

    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3]?.toUpperCase();

      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      now.setHours(hours, minutes, 0, 0);
    }
    return now;
  };

  const handleTimeChange = (event: DateTimePickerChangeEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      const formattedTime = selectedDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      onChange(formattedTime);
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable style={styles.inputBox} onPress={() => setShowPicker(true)}>
        <Ionicons name="time-outline" size={18} color={colors.primary} />
        <Text style={styles.timeText}>{value || 'Select Time'}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={parseTime(value)}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onValueChange={handleTimeChange}
          onDismiss={() => setShowPicker(false)}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.darkText,
      marginBottom: 6,
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
      borderWidth: 1,
      borderColor: colors.softBackground,
      gap: 10,
    },
    timeText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.darkText,
    },
  });
