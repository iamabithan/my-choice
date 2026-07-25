import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

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
