import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}

const AVAILABLE_TIMES = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM'];

export function CalendarView({ onSelectDate, onSelectTime }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate() + 2);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const renderDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isSelected = selectedDate === date.getDate();
      
      days.push(
        <TouchableOpacity 
          key={i} 
          style={[styles.dayCard, isSelected && styles.dayCardSelected]}
          onPress={() => {
            setSelectedDate(date.getDate());
            onSelectDate(date);
          }}
        >
          <Text style={[styles.dayName, isSelected && styles.textSelected]}>
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </Text>
          <Text style={[styles.dayNumber, isSelected && styles.textSelected]}>
            {date.getDate()}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Date & Time</Text>
        <CalendarIcon size={20} color={Colors.textDim} />
      </View>

      <Text style={styles.sectionLabel}>Date</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.daysScroll}
      >
        {renderDays()}
      </ScrollView>

      <Text style={styles.sectionLabel}>Available Time Slots</Text>
      <View style={styles.timesContainer}>
        {AVAILABLE_TIMES.map((time) => (
          <TouchableOpacity 
            key={time} 
            style={[styles.timeChip, selectedTime === time && styles.timeChipSelected]}
            onPress={() => {
              setSelectedTime(time);
              onSelectTime(time);
            }}
          >
            <Text style={[styles.timeText, selectedTime === time && styles.textSelected]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  daysScroll: {
    gap: 12,
    paddingBottom: Spacing.lg,
  },
  dayCard: {
    width: 60,
    height: 80,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayCardSelected: {
    backgroundColor: Colors.info,
    borderColor: Colors.info,
  },
  dayName: {
    fontSize: 12,
    color: Colors.textDim,
    marginBottom: 8,
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipSelected: {
    backgroundColor: Colors.info,
    borderColor: Colors.info,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  textSelected: {
    color: '#fff',
  },
});
