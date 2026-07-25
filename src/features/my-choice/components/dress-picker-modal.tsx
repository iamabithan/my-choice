import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDisplayDate } from '@/lib/dates';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { Dress, DressCategoryFilter } from '../types';
import { DressFeature, ModalDressListSkeleton, NetworkErrorPanel, SkeletonBlock } from './shared';

type Props = {
  category: DressCategoryFilter;
  date: string;
  dresses: Dress[];
  error: string;
  isBusy: boolean;
  isLoading: boolean;
  page: number;
  pages: number;
  search: string;
  suggestedDress: Dress | null;
  total: number;
  visible: boolean;
  onCategoryChange: (category: DressCategoryFilter) => void;
  onChangeSuggestion: () => void;
  onClose: () => void;
  onPageChange: (page: number) => void;
  onPick: (dress: Dress) => void;
  onRetry: () => void;
  onSearch: (value: string) => void;
};

export function DressPickerModal({
  category,
  date,
  dresses,
  error,
  isBusy,
  isLoading,
  page,
  pages,
  search,
  suggestedDress,
  total,
  visible,
  onCategoryChange,
  onChangeSuggestion,
  onClose,
  onPageChange,
  onPick,
  onRetry,
  onSearch,
}: Props) {
  const theme = useTheme();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <Pressable style={styles.modalBackdrop} onPress={onClose}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <ThemedView style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDisplayDate(date)}
                </ThemedText>
                <ThemedText type="subtitle">{suggestedDress ? 'Suggested dress' : 'Choose a dress'}</ThemedText>
              </View>
              <Pressable onPress={onClose} style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={theme.text} />
              </Pressable>
            </View>
            {suggestedDress ? (
              <DressFeature title="Random pick, not worn this week" dress={suggestedDress} compact />
            ) : (
              <View style={styles.searchRow}>
                <TextInput
                  value={search}
                  onChangeText={onSearch}
                  placeholder="Search dresses"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.searchInput, styles.searchGrow, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
                <Pressable
                  onPress={() => {
                    const nextCategory = category === 'all' ? 'modern' : category === 'modern' ? 'traditional' : 'all';
                    onCategoryChange(nextCategory);
                  }}
                  style={[styles.filterButton, { borderColor: theme.backgroundSelected }]}>
                  <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }} size={18} tintColor={theme.text} />
                  <ThemedText type="smallBold">
                    {category === 'all' ? 'All' : category === 'modern' ? 'Modern' : 'Traditional'}
                  </ThemedText>
                </Pressable>
              </View>
            )}
            {!suggestedDress && isLoading && <ModalDressListSkeleton />}
            {!suggestedDress && !isLoading && !!error && (
              <NetworkErrorPanel message={error} onRetry={onRetry} />
            )}
            {!suggestedDress && !isLoading && !error && (
              <ScrollView contentContainerStyle={styles.modalList}>
                {dresses.map((dress) => (
                  <Pressable key={dress._id} onPress={() => onPick(dress)} style={styles.modalDressRow}>
                    <Image source={{ uri: dress.imageUrl }} style={styles.modalDressImage} contentFit="cover" />
                    <ThemedText style={styles.modalDressName}>{dress.name}</ThemedText>
                    <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={22} tintColor="#27AE60" />
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {!suggestedDress && !isLoading && !error && (
              <View style={styles.paginationRow}>
                <Pressable
                  disabled={page <= 1}
                  onPress={() => onPageChange(page - 1)}
                  style={[styles.pageButton, { borderColor: theme.backgroundSelected, opacity: page <= 1 ? 0.45 : 1 }]}>
                  <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={18} tintColor={theme.text} />
                </Pressable>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Page {page} of {pages} · {total}
                </ThemedText>
                <Pressable
                  disabled={page >= pages}
                  onPress={() => onPageChange(page + 1)}
                  style={[styles.pageButton, { borderColor: theme.backgroundSelected, opacity: page >= pages ? 0.45 : 1 }]}>
                  <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={theme.text} />
                </Pressable>
              </View>
            )}
            {suggestedDress && (
              <View style={styles.modalActions}>
                {isBusy ? (
                  <>
                    <SkeletonBlock style={[styles.skeletonButtonFull, styles.modalActionButton]} />
                    <SkeletonBlock style={[styles.skeletonButtonFull, styles.modalActionButton]} />
                    <SkeletonBlock style={[styles.skeletonButtonFull, styles.modalActionButton]} />
                  </>
                ) : (
                  <>
                    <Pressable onPress={() => onPick(suggestedDress)} style={[styles.primaryButton, styles.modalActionButton]}>
                      <ThemedText style={styles.primaryButtonText}>Confirm</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => setIsPreviewOpen(true)} style={[styles.secondaryButton, styles.modalActionButton]}>
                      <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                        View
                      </ThemedText>
                    </Pressable>
                    <Pressable onPress={onChangeSuggestion} style={[styles.secondaryButton, styles.modalActionButton]}>
                      <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                        Change
                      </ThemedText>
                    </Pressable>
                  </>
                )}
              </View>
            )}
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={isPreviewOpen && !!suggestedDress} animationType="fade" transparent onRequestClose={() => setIsPreviewOpen(false)}>
        <Pressable style={styles.imagePreviewBackdrop} onPress={() => setIsPreviewOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.imagePreviewSheet}>
            <Pressable onPress={() => setIsPreviewOpen(false)} style={[styles.imagePreviewClose, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={theme.text} />
            </Pressable>
            {!!suggestedDress && (
              <Image source={{ uri: suggestedDress.imageUrl }} style={styles.imagePreview} contentFit="contain" />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
