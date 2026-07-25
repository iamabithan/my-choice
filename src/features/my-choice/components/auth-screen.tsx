import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

import { myChoiceStyles as styles } from '../styles';
import type { AuthMode } from '../types';

type Props = {
  authMode: AuthMode;
  email: string;
  isBusy: boolean;
  isGoogleReady: boolean;
  name: string;
  password: string;
  status: string;
  onEmailAuth: () => void;
  onGoogleAuth: () => void;
  onModeChange: (mode: AuthMode) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

export function AuthScreen({
  authMode,
  email,
  isBusy,
  isGoogleReady,
  name,
  password,
  status,
  onEmailAuth,
  onGoogleAuth,
  onModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
}: Props) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.authKeyboard}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.authHero}>
            <Image source={require('../../../../assets/images/icon.png')} style={styles.authLogo} contentFit="cover" />
            <ThemedText type="title" style={styles.authTitle}>
              My Choice
            </ThemedText>
            <ThemedText style={styles.authCopy} themeColor="textSecondary">
              Sign in to save dresses, plan dates, and get a fresh daily outfit suggestion.
            </ThemedText>

            <ThemedView type="backgroundElement" style={styles.authCard}>
              <View style={[styles.segmentedControl, { backgroundColor: theme.backgroundSelected }]}>
                {(['login', 'register'] as AuthMode[]).map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => onModeChange(mode)}
                    style={[styles.segmentButton, authMode === mode && styles.segmentButtonActive]}>
                    <ThemedText
                      type="smallBold"
                      style={authMode === mode && styles.segmentTextActive}>
                      {mode === 'login' ? 'Login' : 'Create account'}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {authMode === 'register' && (
                <TextInput
                  value={name}
                  onChangeText={onNameChange}
                  placeholder="Name"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              )}
              <TextInput
                value={email}
                onChangeText={onEmailChange}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
              <TextInput
                value={password}
                onChangeText={onPasswordChange}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                textContentType={authMode === 'register' ? 'newPassword' : 'password'}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={onEmailAuth}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { opacity: pressed || isBusy ? 0.78 : 1 },
                ]}>
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>
                    {authMode === 'login' ? 'Login' : 'Create account'}
                  </ThemedText>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <ThemedText type="small" themeColor="textSecondary">
                  or
                </ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={onGoogleAuth}
                style={({ pressed }) => [
                  styles.googleButton,
                  { opacity: pressed || isBusy ? 0.78 : 1 },
                ]}>
                <SymbolView name={{ ios: 'person.crop.circle.badge.checkmark', android: 'account_circle', web: 'account_circle' }} size={20} tintColor={theme.text} />
                <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
              </Pressable>
              {!isGoogleReady && (
                <ThemedText type="small" themeColor="textSecondary">
                  Google sign in needs OAuth setup.
                </ThemedText>
              )}
            </ThemedView>

            {!!status && <ThemedText style={styles.statusText}>{status}</ThemedText>}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
