import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

import { myChoiceStyles as styles } from '../styles';
import type { Dress, PlannedOutfit } from '../types';
import { DressFeature, EmptyPanel } from './shared';

type Props = {
  dresses: Dress[];
  todayPlan?: PlannedOutfit;
  onAddDress: () => void;
  onOpenSuggestion: () => void;
};

export function TodaySection({ dresses, todayPlan, onAddDress, onOpenSuggestion }: Props) {
  return (
    <View style={styles.section}>
      <ThemedText type="title" style={styles.pageTitle}>
        Today
      </ThemedText>
      {todayPlan ? (
        <DressFeature title="Selected for today" dress={todayPlan.dressId} />
      ) : dresses.length ? (
        <EmptyPanel
          title="Suggested outfit is ready"
          body="My Choice picked a random dress that has not been worn this week."
          action="View suggestion"
          onPress={onOpenSuggestion}
        />
      ) : (
        <EmptyPanel
          title="Upload your first dress"
          body="Add a name and photo. Once your wardrobe has items, My Choice can suggest one every day."
          action="Add dress"
          onPress={onAddDress}
        />
      )}
    </View>
  );
}
