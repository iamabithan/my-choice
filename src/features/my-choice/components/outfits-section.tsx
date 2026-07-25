import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { Dress, DressCategoryFilter } from '../types';
import { DressCard, EmptyPanel } from './shared';

type Props = {
  category: DressCategoryFilter;
  dresses: Dress[];
  page: number;
  pages: number;
  search: string;
  total: number;
  onCategoryChange: (category: DressCategoryFilter) => void;
  onDressOption: (dress: Dress, action: 'pause' | 'edit' | 'calendar' | 'delete') => void;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onPickDress: (dress: Dress) => void;
  onUploadPress: () => void;
};

export function OutfitsSection({
  category,
  dresses,
  page,
  pages,
  search,
  total,
  onCategoryChange,
  onDressOption,
  onPageChange,
  onSearchChange,
  onPickDress,
  onUploadPress,
}: Props) {
  const theme = useTheme();
  const [openMenuDressId, setOpenMenuDressId] = useState<string | null>(null);

  return (
    <Pressable onPress={() => setOpenMenuDressId(null)} style={styles.section}>
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
        <Pressable
          accessibilityRole="button"
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
      {dresses.length ? (
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
