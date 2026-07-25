import type * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { DressCategory } from '../types';
import { SkeletonBlock } from './shared';

type Props = {
  category: DressCategory;
  image: ImagePicker.ImagePickerAsset | null;
  isBusy: boolean;
  name: string;
  visible: boolean;
  onCancel: () => void;
  onCategoryChange: (value: DressCategory) => void;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
};

const categoryOptions: { label: string; value: DressCategory }[] = [
  { label: 'Modern', value: 'modern' },
  { label: 'Traditional', value: 'traditional' },
];

export function UploadDressModal({
  category,
  image,
  isBusy,
  name,
  visible,
  onCancel,
  onCategoryChange,
  onNameChange,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const selectedCategory = categoryOptions.find((option) => option.value === category) ?? categoryOptions[0];
  const previewHeight = Math.min(260, height * 0.32);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.uploadKeyboardAvoider}>
        <Pressable style={styles.modalBackdrop} onPress={onCancel}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.uploadModalWrap}>
            <ThemedView style={[styles.modalSheet, styles.uploadModalSheet, { paddingBottom: Math.max(insets.bottom + 8, 14) }]}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View>
                  <ThemedText type="small" themeColor="textSecondary">
                    New dress
                  </ThemedText>
                  <ThemedText type="subtitle">Name this outfit</ThemedText>
                </View>
                <Pressable onPress={onCancel} style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]}>
                  <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={theme.text} />
                </Pressable>
              </View>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                showsVerticalScrollIndicator={false}
                style={styles.uploadScroll}
                contentContainerStyle={styles.uploadForm}>
                {image && (
                  <Image
                    source={{ uri: image.uri }}
                    style={[styles.uploadPreview, { height: previewHeight }]}
                    contentFit="cover"
                  />
                )}
                <TextInput
                  value={name}
                  onChangeText={onNameChange}
                  placeholder="Dress name"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
                <View>
                  <Pressable
                    onPress={() => setIsCategoryOpen((current) => !current)}
                    style={[styles.categoryDropdown, { borderColor: theme.backgroundSelected }]}>
                    <ThemedText type="smallBold">{selectedCategory.label}</ThemedText>
                    <SymbolView
                      name={{ ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' }}
                      size={18}
                      tintColor={theme.text}
                    />
                  </Pressable>
                  {isCategoryOpen && (
                    <View style={[styles.categoryMenu, { borderColor: theme.backgroundSelected }]}>
                      {categoryOptions.map((option) => {
                        const active = option.value === category;
                        return (
                          <Pressable
                            key={option.value}
                            onPress={() => {
                              onCategoryChange(option.value);
                              setIsCategoryOpen(false);
                            }}
                            style={[
                              styles.categoryOption,
                              active && { backgroundColor: theme.backgroundSelected },
                            ]}>
                            <ThemedText type="smallBold">{option.label}</ThemedText>
                            {active && (
                              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={16} tintColor={theme.text} />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              </ScrollView>
              <View style={styles.uploadFooter}>
                {isBusy ? (
                  <SkeletonBlock style={styles.skeletonButtonFull} />
                ) : (
                  <Pressable
                    onPress={onSubmit}
                    style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.78 : 1 }]}>
                    <ThemedText style={styles.primaryButtonText}>Upload dress</ThemedText>
                  </Pressable>
                )}
              </View>
            </ThemedView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
