import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addDays, formatDisplayDate, monthRange, startOfMonth, toDateKey } from '@/lib/dates';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { Dress, DressCategory, PlannedOutfit, SuggestionPauseDuration } from '../types';
import { CalendarHistorySkeleton, NetworkErrorPanel, SkeletonBlock } from './shared';

const pauseOptions: { label: string; value: SuggestionPauseDuration }[] = [
  { label: 'For a week', value: 'week' },
  { label: 'For a month', value: 'month' },
  { label: 'For a year', value: 'year' },
  { label: 'Never suggest', value: 'never' },
];

const categoryOptions: { label: string; value: DressCategory }[] = [
  { label: 'Modern', value: 'modern' },
  { label: 'Traditional', value: 'traditional' },
];

export function PauseSuggestionModal({
  dress,
  duration,
  visible,
  isBusy,
  onCancel,
  onConfirm,
  onDurationChange,
}: {
  dress: Dress | null;
  duration: SuggestionPauseDuration;
  visible: boolean;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onDurationChange: (duration: SuggestionPauseDuration) => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalSheetWrap}>
          <ThemedView style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                {dress?.name ?? 'Dress'}
              </ThemedText>
              <ThemedText type="subtitle">Don&apos;t suggest</ThemedText>
            </View>
            <Pressable onPress={onCancel} style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={theme.text} />
            </Pressable>
          </View>
          <View style={styles.radioList}>
            {pauseOptions.map((option) => {
              const active = duration === option.value;
              return (
                <Pressable key={option.value} onPress={() => onDurationChange(option.value)} style={styles.radioRow}>
                  <View style={[styles.radioOuter, { borderColor: active ? '#0EA5E9' : theme.backgroundSelected }]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <ThemedText type="smallBold">{option.label}</ThemedText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.modalFooter}>
            {isBusy ? (
              <SkeletonBlock style={styles.skeletonButtonFull} />
            ) : (
              <Pressable onPress={onConfirm} style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Confirm</ThemedText>
              </Pressable>
            )}
          </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function EditDressModal({
  category,
  name,
  visible,
  isBusy,
  onCancel,
  onCategoryChange,
  onNameChange,
  onSave,
}: {
  category: DressCategory;
  name: string;
  visible: boolean;
  isBusy: boolean;
  onCancel: () => void;
  onCategoryChange: (category: DressCategory) => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalSheetWrap}>
          <ThemedView style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Outfit details
              </ThemedText>
              <ThemedText type="subtitle">Edit dress</ThemedText>
            </View>
            <Pressable onPress={onCancel} style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={theme.text} />
            </Pressable>
          </View>
          <TextInput
            value={name}
            onChangeText={onNameChange}
            placeholder="Dress name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <View style={styles.categoryPills}>
            {categoryOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => onCategoryChange(option.value)}
                style={[
                  styles.categoryPill,
                  { borderColor: theme.backgroundSelected },
                  category === option.value && styles.categoryPillActive,
                ]}>
                <ThemedText type="smallBold" style={category === option.value && styles.activeMenuLabel}>
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <View style={styles.modalFooter}>
            {isBusy ? (
              <SkeletonBlock style={styles.skeletonButtonFull} />
            ) : (
              <Pressable onPress={onSave} style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Save changes</ThemedText>
              </Pressable>
            )}
          </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DressCalendarModal({
  dress,
  month,
  plans,
  visible,
  isLoading,
  error,
  onBack,
  onMonthChange,
  onRetry,
}: {
  dress: Dress | null;
  month: Date;
  plans: PlannedOutfit[];
  visible: boolean;
  isLoading: boolean;
  error: string;
  onBack: () => void;
  onMonthChange: (month: Date) => void;
  onRetry: () => void;
}) {
  const theme = useTheme();
  const days = monthRange(month);
  const wornDates = new Set(plans.map((plan) => plan.date));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onBack}>
      <Pressable style={styles.modalBackdrop} onPress={onBack}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalSheetWrap}>
          <ThemedView style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Pressable onPress={onBack} style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]}>
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={18} tintColor={theme.text} />
            </Pressable>
            <View style={styles.modalDressName}>
              <ThemedText type="small" themeColor="textSecondary">
                Worn calendar
              </ThemedText>
              <ThemedText type="subtitle">{dress?.name ?? 'Dress'}</ThemedText>
            </View>
          </View>
          <View style={styles.calendarHeader}>
            <Pressable style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]} onPress={() => onMonthChange(startOfMonth(addDays(month, -1)))}>
              <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={18} tintColor={theme.text} />
            </Pressable>
            <ThemedText type="subtitle" style={styles.monthTitle}>
              {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </ThemedText>
            <Pressable style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]} onPress={() => onMonthChange(startOfMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)))}>
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
              const isCurrentMonth = day.getMonth() === month.getMonth();
              const wasWorn = wornDates.has(dateKey);
              return (
                <View key={dateKey} style={[styles.dayCell, !isCurrentMonth && styles.dimmedDay, wasWorn && styles.selectedDay]}>
                  <ThemedText type="smallBold" style={wasWorn && styles.selectedDayText}>
                    {day.getDate()}
                  </ThemedText>
                  {wasWorn && <View style={styles.whiteDot} />}
                </View>
              );
            })}
          </View>
          {isLoading ? (
            <CalendarHistorySkeleton />
          ) : error ? (
            <NetworkErrorPanel message={error} onRetry={onRetry} />
          ) : (
            <ScrollView contentContainerStyle={styles.modalList}>
              {plans.length ? (
                plans.map((plan) => (
                  <ThemedText key={plan._id} type="smallBold">
                    {formatDisplayDate(plan.date)}
                  </ThemedText>
                ))
              ) : (
                <ThemedText themeColor="textSecondary">This dress was not worn in this month.</ThemedText>
              )}
            </ScrollView>
          )}
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
