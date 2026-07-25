import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { Dress, Section, SymbolName } from '../types';

export function DressFeature({ title, dress, compact }: { title: string; dress: Dress; compact?: boolean }) {
  return (
    <ThemedView type="backgroundElement" style={[styles.featureCard, compact && styles.compactFeature]}>
      <Image
        source={{ uri: dress.imageUrl }}
        style={compact ? styles.compactFeatureImage : styles.featureImage}
        contentFit="cover"
      />
      <View style={styles.featureText}>
        <ThemedText type="small" themeColor="textSecondary">
          {title}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.featureTitle}>
          {dress.name}
        </ThemedText>
        {!!dress.category && (
          <ThemedText type="small" themeColor="textSecondary">
            {dress.category === 'traditional' ? 'Traditional' : 'Modern'}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

export function DressCard({
  dress,
  isMenuOpen = false,
  onCloseMenu,
  onMenuToggle,
  onOption,
  onPress,
}: {
  dress: Dress;
  isMenuOpen?: boolean;
  onCloseMenu?: () => void;
  onMenuToggle?: () => void;
  onOption?: (action: 'pause' | 'edit' | 'calendar' | 'delete') => void;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation();
        onCloseMenu?.();
        onPress();
      }}
      style={styles.dressCard}>
      <Image source={{ uri: dress.imageUrl }} style={styles.dressImage} contentFit="cover" />
      {!!onOption && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open options for ${dress.name}`}
          onPress={(event) => {
            event.stopPropagation();
            onMenuToggle?.();
          }}
          style={[styles.dressMenuButton, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView name={{ ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' }} size={18} tintColor={theme.text} />
        </Pressable>
      )}
      {isMenuOpen && !!onOption && (
        <View style={[styles.dressOptionsMenu, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          {([
            { key: 'pause', label: "Don't suggest", icon: { ios: 'bell.slash', android: 'notifications_off', web: 'notifications_off' } },
            { key: 'edit', label: 'Edit', icon: { ios: 'pencil', android: 'edit', web: 'edit' } },
            { key: 'calendar', label: 'View calendar', icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' } },
            { key: 'delete', label: 'Delete', icon: { ios: 'trash', android: 'delete', web: 'delete' } },
          ] as { key: 'pause' | 'edit' | 'calendar' | 'delete'; label: string; icon: SymbolName }[]).map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                onCloseMenu?.();
                onOption(item.key);
              }}
              style={styles.dressOptionRow}>
              <SymbolView name={item.icon} size={16} tintColor={item.key === 'delete' ? '#E43D12' : theme.text} />
              <ThemedText type="smallBold" style={item.key === 'delete' && styles.deleteText}>
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
      <ThemedText type="smallBold" numberOfLines={1}>
        {dress.name}
      </ThemedText>
      {!!dress.category && (
        <ThemedText type="small" themeColor="textSecondary">
          {dress.category === 'traditional' ? 'Traditional' : 'Modern'}
        </ThemedText>
      )}
    </Pressable>
  );
}

export function EmptyPanel({
  title,
  body,
  action,
  onPress,
}: {
  title: string;
  body: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.emptyPanel}>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary">{body}</ThemedText>
      <Pressable onPress={onPress} style={styles.secondaryButton}>
        <ThemedText type="smallBold" style={styles.secondaryButtonText}>
          {action}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

export function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.skeletonBlock,
        { backgroundColor: theme.backgroundSelected },
        style,
      ]}
    />
  );
}

export function AppSkeleton() {
  return (
    <ThemedView style={styles.content}>
      <View style={styles.header}>
        <View style={styles.skeletonStack}>
          <SkeletonBlock style={styles.skeletonShortLine} />
          <SkeletonBlock style={styles.skeletonTitleLine} />
        </View>
        <SkeletonBlock style={styles.skeletonIcon} />
      </View>
      <View style={styles.section}>
        <SkeletonBlock style={styles.skeletonPageTitle} />
        <SkeletonBlock style={styles.skeletonHeroCard} />
        <View style={styles.skeletonPanel}>
          <SkeletonBlock style={styles.skeletonLine} />
          <SkeletonBlock style={styles.skeletonWideLine} />
          <SkeletonBlock style={styles.skeletonButton} />
        </View>
      </View>
    </ThemedView>
  );
}

export function OutfitsSkeleton() {
  return (
    <View style={styles.dressGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.dressCard}>
          <SkeletonBlock style={styles.dressImage} />
          <SkeletonBlock style={styles.skeletonLine} />
          <SkeletonBlock style={styles.skeletonShortLine} />
        </View>
      ))}
    </View>
  );
}

export function PickerControlsSkeleton() {
  return (
    <View style={styles.searchRow}>
      <SkeletonBlock style={[styles.searchInput, styles.searchGrow]} />
      <SkeletonBlock style={styles.skeletonFilter} />
    </View>
  );
}

export function PickerListSkeleton() {
  return (
    <>
      <PickerControlsSkeleton />
      <View style={styles.dressGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={styles.dressCard}>
            <SkeletonBlock style={styles.dressImage} />
            <SkeletonBlock style={styles.skeletonLine} />
            <SkeletonBlock style={styles.skeletonShortLine} />
          </View>
        ))}
      </View>
    </>
  );
}

export function ModalDressListSkeleton() {
  return (
    <View style={styles.modalList}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.modalDressRow}>
          <SkeletonBlock style={styles.modalDressImage} />
          <View style={styles.modalDressName}>
            <SkeletonBlock style={styles.skeletonLine} />
            <SkeletonBlock style={styles.skeletonShortLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CalendarHistorySkeleton() {
  return (
    <View style={styles.modalList}>
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBlock key={index} style={styles.skeletonHistoryLine} />
      ))}
    </View>
  );
}

export function NetworkErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.networkPanel}>
      <SymbolView name={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }} size={30} tintColor="#E43D12" />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Network error
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.networkCopy}>
        {message}
      </ThemedText>
      <Pressable onPress={onRetry} style={styles.secondaryButton}>
        <ThemedText type="smallBold" style={styles.secondaryButtonText}>
          Retry
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function MenuButton({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: SymbolName;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.menuButton, active && styles.activeMenuButton]}>
      <SymbolView name={icon} size={18} tintColor={active ? '#ffffff' : theme.textSecondary} />
      <ThemedText
        type="smallBold"
        themeColor={active ? undefined : 'textSecondary'}
        style={[styles.menuLabel, active && styles.activeMenuLabel]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function FloatingMenu({
  section,
  onChange,
  backgroundColor,
}: {
  section: Section;
  onChange: (section: Section) => void;
  backgroundColor: string;
}) {
  return (
    <View style={[styles.floatingMenu, { backgroundColor }]}>
      <MenuButton active={section === 'today'} label="Today" icon={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} onPress={() => onChange('today')} />
      <MenuButton active={section === 'calendar'} label="Calendar" icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} onPress={() => onChange('calendar')} />
      <MenuButton active={section === 'outfits'} label="My Outfit" icon={{ ios: 'hanger', android: 'checkroom', web: 'checkroom' }} onPress={() => onChange('outfits')} />
    </View>
  );
}
