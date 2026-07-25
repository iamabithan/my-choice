import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  addDays,
  formatDisplayDate,
  monthRange,
  startOfMonth,
  toDateKey,
} from '@/lib/dates';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { PlannedOutfit } from '../types';
import { DressFeature, EmptyPanel } from './shared';

type Props = {
  currentPlan?: PlannedOutfit;
  hasDresses: boolean;
  plannedByDate: Map<string, PlannedOutfit>;
  selectedDate: string;
  visibleMonth: Date;
  onMonthChange: (month: Date) => void;
  onDeletePlan: () => void;
  onOpenDate: (date: string) => void;
  onSelectDress: () => void;
  onUploadDress: () => void;
};

export function CalendarSection({
  currentPlan,
  hasDresses,
  plannedByDate,
  selectedDate,
  visibleMonth,
  onMonthChange,
  onDeletePlan,
  onOpenDate,
  onSelectDress,
  onUploadDress,
}: Props) {
  const theme = useTheme();
  const days = monthRange(visibleMonth);

  return (
    <View style={styles.section}>
      <View style={styles.calendarHeader}>
        <Pressable style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]} onPress={() => onMonthChange(startOfMonth(addDays(visibleMonth, -1)))}>
          <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={18} tintColor={theme.text} />
        </Pressable>
        <ThemedText type="subtitle" style={styles.monthTitle}>
          {visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </ThemedText>
        <Pressable style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]} onPress={() => onMonthChange(startOfMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)))}>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={theme.text} />
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <ThemedText key={`${day}-${index}`} type="smallBold" style={styles.weekDay} themeColor="textSecondary">
            {day}
          </ThemedText>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const plan = plannedByDate.get(dateKey);
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const isSelected = selectedDate === dateKey;
          return (
            <Pressable
              key={dateKey}
              onPress={() => onOpenDate(dateKey)}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.dimmedDay,
                isSelected && styles.selectedDay,
              ]}>
              <ThemedText type="smallBold" style={isSelected && styles.selectedDayText}>
                {day.getDate()}
              </ThemedText>
              {plan && <View style={styles.planDot} />}
            </Pressable>
          );
        })}
      </View>
      <ThemedView type="backgroundElement" style={styles.selectedPanel}>
        <View style={styles.selectedPanelHeader}>
          <ThemedText type="smallBold">{formatDisplayDate(selectedDate)}</ThemedText>
          {currentPlan && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete outfit from this date"
              onPress={onDeletePlan}
              style={[styles.smallDangerButton, { borderColor: theme.backgroundSelected }]}>
              <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={16} tintColor="#E43D12" />
            </Pressable>
          )}
        </View>
        {currentPlan ? (
          <>
            <DressFeature title="Planned outfit" dress={currentPlan.dressId} compact />
            <Pressable onPress={onSelectDress} style={styles.secondaryButton}>
              <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                Change dress
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <EmptyPanel
            title="No dress selected"
            body="Choose an uploaded dress for this date."
            action={hasDresses ? 'Select dress' : 'Upload dress'}
            onPress={hasDresses ? onSelectDress : onUploadDress}
          />
        )}
      </ThemedView>
    </View>
  );
}
