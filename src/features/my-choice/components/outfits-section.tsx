import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { Dress, DressCategoryFilter } from '../types';
import { DressCard, EmptyPanel, NetworkErrorPanel, OutfitsSkeleton } from './shared';

const categoryOptions: { label: string; value: DressCategoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Modern', value: 'modern' },
  { label: 'Traditional', value: 'traditional' },
];

type Props = {
  category: DressCategoryFilter;
  dresses: Dress[];
  error: string;
  isLoading: boolean;
  page: number;
  pages: number;
  search: string;
  total: number;
  onCategoryChange: (category: DressCategoryFilter) => void;
  onDressOption: (dress: Dress, action: 'pause' | 'resume' | 'edit' | 'calendar' | 'delete') => void;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onPickDress: (dress: Dress) => void;
  onRetry: () => void;
  onUploadPress: () => void;
};

export function OutfitsSection({
  category,
  dresses,
  error,
  isLoading,
  page,
  pages,
  search,
  total,
  onCategoryChange,
  onDressOption,
  onPageChange,
  onSearchChange,
  onPickDress,
  onRetry,
  onUploadPress,
}: Props) {
  const theme = useTheme();
  const [openMenuDressId, setOpenMenuDressId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const selectedCategoryLabel = categoryOptions.find((option) => option.value === category)?.label ?? 'All';

  return (
    <Pressable
      onPress={() => {
        setOpenMenuDressId(null);
        setIsFilterOpen(false);
      }}
      style={styles.section}>
      <View style={styles.pageHeader}>
        <ThemedText type="title" style={styles.pageTitle}>
          My Outfit
        </ThemedText>
        <Pressable accessibilityRole="button" accessibilityLabel="Upload dress" onPress={onUploadPress} style={styles.uploadIconButton}>
          <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={26} tintColor="#ffffff" />
        </Pressable>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search dresses"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, styles.searchGrow, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
        <View style={styles.filterWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter dresses by category"
            onPress={(event) => {
              event.stopPropagation();
              setOpenMenuDressId(null);
              setIsFilterOpen((current) => !current);
            }}
            style={[styles.filterButton, { borderColor: theme.backgroundSelected }]}>
            <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }} size={18} tintColor={theme.text} />
            <ThemedText type="smallBold">{selectedCategoryLabel}</ThemedText>
            <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={16} tintColor={theme.textSecondary} />
          </Pressable>
          {isFilterOpen && (
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={[styles.filterMenu, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              {categoryOptions.map((option) => {
                const active = category === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={(event) => {
                      event.stopPropagation();
                      onCategoryChange(option.value);
                      setIsFilterOpen(false);
                    }}
                    style={styles.filterOption}>
                    <ThemedText type="smallBold" style={active && styles.secondaryButtonText}>
                      {option.label}
                    </ThemedText>
                    {active && (
                      <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={16} tintColor="#0EA5E9" />
                    )}
                  </Pressable>
                );
              })}
            </Pressable>
          )}
        </View>
      </View>
      {isLoading ? (
        <OutfitsSkeleton />
      ) : error ? (
        <NetworkErrorPanel message={error} onRetry={onRetry} />
      ) : dresses.length ? (
        <>
          <View style={styles.dressGrid}>
            {dresses.map((dress) => (
              <DressCard
                key={dress._id}
                dress={dress}
                isMenuOpen={openMenuDressId === dress._id}
                onCloseMenu={() => setOpenMenuDressId(null)}
                onMenuToggle={() =>
                  setOpenMenuDressId((current) => (current === dress._id ? null : dress._id))
                }
                onOption={(action) => onDressOption(dress, action)}
                onPress={() => onPickDress(dress)}
              />
            ))}
          </View>
          <View style={styles.paginationRow}>
            <Pressable
              disabled={page <= 1}
              onPress={() => onPageChange(page - 1)}
              style={[styles.pageButton, { borderColor: theme.backgroundSelected, opacity: page <= 1 ? 0.45 : 1 }]}>
              <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={18} tintColor={theme.text} />
            </Pressable>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Page {page} of {pages} · {total} dresses
            </ThemedText>
            <Pressable
              disabled={page >= pages}
              onPress={() => onPageChange(page + 1)}
              style={[styles.pageButton, { borderColor: theme.backgroundSelected, opacity: page >= pages ? 0.45 : 1 }]}>
              <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={theme.text} />
            </Pressable>
          </View>
        </>
      ) : (
        <EmptyPanel
          title="No dresses found"
          body="Try another search or upload a new dress."
          action="Upload dress"
          onPress={onUploadPress}
        />
      )}
    </Pressable>
  );
}
