import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeMode } from '@/context/theme-mode';
import { addDays, fromDateKey, monthRange, startOfMonth, toDateKey } from '@/lib/dates';
import { useTheme } from '@/hooks/use-theme';

import { AuthScreen } from './components/auth-screen';
import { CalendarSection } from './components/calendar-section';
import { DressPickerModal } from './components/dress-picker-modal';
import { AppSkeleton, FloatingMenu, NetworkErrorPanel } from './components/shared';
import { DressCalendarModal, EditDressModal, PauseSuggestionModal } from './components/outfit-action-modals';
import { OutfitsSection } from './components/outfits-section';
import { TodaySection } from './components/today-section';
import { UploadDressModal } from './components/upload-dress-modal';
import { clearToken, isNetworkError, loadToken, myChoiceApi, saveToken } from './services/my-choice-api';
import { myChoiceStyles as styles } from './styles';
import type { AuthMode, Dress, DressCategory, DressCategoryFilter, PlannedOutfit, Section, SuggestionPauseDuration, User } from './types';
import { pickRandomSuggestion } from './utils/suggestions';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  initialSection?: Section;
};

const LAST_SUGGESTION_KEY = 'my-choice-last-suggestion-date';
const WARDROBE_PAGE_SIZE = 8;
const PICKER_PAGE_SIZE = 12;
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const todayKey = () => toDateKey(new Date());
const suggestionKeyForUser = (userId: string) => `${LAST_SUGGESTION_KEY}:${userId}`;

export function MyChoice({ initialSection = 'today' }: Props) {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const [section, setSection] = useState<Section>(initialSection);
  const [user, setUser] = useState<User | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [networkError, setNetworkError] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [outfitDresses, setOutfitDresses] = useState<Dress[]>([]);
  const [outfitSearch, setOutfitSearch] = useState('');
  const [outfitCategory, setOutfitCategory] = useState<DressCategoryFilter>('all');
  const [outfitPage, setOutfitPage] = useState(1);
  const [outfitPages, setOutfitPages] = useState(1);
  const [outfitTotal, setOutfitTotal] = useState(0);
  const [isOutfitsLoading, setIsOutfitsLoading] = useState(false);
  const [outfitsError, setOutfitsError] = useState('');
  const [pickerDresses, setPickerDresses] = useState<Dress[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<DressCategoryFilter>('all');
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerPages, setPickerPages] = useState(1);
  const [pickerTotal, setPickerTotal] = useState(0);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState('');
  const [plans, setPlans] = useState<PlannedOutfit[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(new Date()));
  const [dressName, setDressName] = useState('');
  const [dressCategory, setDressCategory] = useState<DressCategory>('modern');
  const [pickedImage, setPickedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [suggestedDress, setSuggestedDress] = useState<Dress | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDressAction, setSelectedDressAction] = useState<Dress | null>(null);
  const [pauseDuration, setPauseDuration] = useState<SuggestionPauseDuration>('week');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<DressCategory>('modern');
  const [historyMonth, setHistoryMonth] = useState(startOfMonth(new Date()));
  const [historyPlans, setHistoryPlans] = useState<PlannedOutfit[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [actionModal, setActionModal] = useState<'pause' | 'edit' | 'calendar' | null>(null);
  const sectionProgress = useMemo(() => new Animated.Value(1), []);

  const isGoogleClientConfigured =
    Platform.OS === 'android'
      ? !!googleAndroidClientId
      : !!googleWebClientId && googleWebClientId !== googleAndroidClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: googleAndroidClientId,
    webClientId: googleWebClientId,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  });

  const plannedByDate = useMemo(() => new Map(plans.map((plan) => [plan.date, plan])), [plans]);
  const currentPlan = plannedByDate.get(selectedDate);
  const todayPlan = plannedByDate.get(todayKey());
  const isAnyModalOpen = isPickerOpen || !!suggestedDress || isUploadOpen || !!actionModal;

  const resetUserScopedState = useCallback(() => {
    setDresses([]);
    setOutfitDresses([]);
    setOutfitSearch('');
    setOutfitCategory('all');
    setOutfitPage(1);
    setOutfitPages(1);
    setOutfitTotal(0);
    setOutfitsError('');
    setPickerDresses([]);
    setPickerSearch('');
    setPickerCategory('all');
    setPickerPage(1);
    setPickerPages(1);
    setPickerTotal(0);
    setPickerError('');
    setPlans([]);
    setSelectedDate(todayKey());
    setVisibleMonth(startOfMonth(new Date()));
    setDressName('');
    setDressCategory('modern');
    setPickedImage(null);
    setSuggestedDress(null);
    setIsPickerOpen(false);
    setIsUploadOpen(false);
    setSelectedDressAction(null);
    setPauseDuration('week');
    setEditName('');
    setEditCategory('modern');
    setHistoryMonth(startOfMonth(new Date()));
    setHistoryPlans([]);
    setHistoryError('');
    setActionModal(null);
  }, []);

  useEffect(() => {
    sectionProgress.setValue(0);
    Animated.timing(sectionProgress, {
      toValue: 1,
      duration: 240,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [section, sectionProgress]);

  const refresh = useCallback(async () => {
    const current = todayKey();
    const from = '2000-01-01';
    const to = toDateKey(addDays(fromDateKey(current), 45));
    const [nextDressResponse, nextPlans] = await Promise.all([
      myChoiceApi.listDresses({ limit: 100 }),
      myChoiceApi.listPlans(from, to),
    ]);
    const nextDresses = nextDressResponse.items;
    setDresses(nextDresses);
    setPlans(nextPlans);
    return { nextDresses, nextPlans };
  }, []);

  const loadOutfitDresses = useCallback(async () => {
    try {
      setIsOutfitsLoading(true);
      setOutfitsError('');
      const response = await myChoiceApi.listDresses({
        category: outfitCategory,
        limit: WARDROBE_PAGE_SIZE,
        page: outfitPage,
        search: outfitSearch,
      });
      setOutfitDresses(response.items);
      setOutfitPage(response.page);
      setOutfitPages(response.pages);
      setOutfitTotal(response.total);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load outfits.';
      if (isNetworkError(error)) setOutfitsError(message);
      else setStatus(message);
    } finally {
      setIsOutfitsLoading(false);
    }
  }, [outfitCategory, outfitPage, outfitSearch]);

  const loadPickerDresses = useCallback(async () => {
    try {
      setIsPickerLoading(true);
      setPickerError('');
      const response = await myChoiceApi.listDresses({
        category: pickerCategory,
        limit: PICKER_PAGE_SIZE,
        page: pickerPage,
        search: pickerSearch,
      });
      setPickerDresses(response.items);
      setPickerPage(response.page);
      setPickerPages(response.pages);
      setPickerTotal(response.total);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load dresses.';
      if (isNetworkError(error)) setPickerError(message);
      else setStatus(message);
    } finally {
      setIsPickerLoading(false);
    }
  }, [pickerCategory, pickerPage, pickerSearch]);

  const openAutomaticSuggestion = useCallback(
    async (nextDresses: Dress[], nextPlans: PlannedOutfit[], userId: string) => {
      const current = todayKey();
      const hasTodayPlan = nextPlans.some((plan) => plan.date === current);
      const lastSuggestion = await AsyncStorage.getItem(suggestionKeyForUser(userId));

      if (lastSuggestion === current || hasTodayPlan || nextDresses.length === 0) return;

      const suggestion = pickRandomSuggestion(nextDresses, nextPlans, current);
      if (suggestion) {
        setSelectedDate(current);
        setSuggestedDress(suggestion);
        await AsyncStorage.setItem(suggestionKeyForUser(userId), current);
      }
    },
    []
  );

  useEffect(() => {
    if (!user || section !== 'outfits') return;
    const timeout = setTimeout(() => {
      loadOutfitDresses();
    }, 0);
    return () => clearTimeout(timeout);
  }, [loadOutfitDresses, section, user]);

  useEffect(() => {
    if (!user || !isPickerOpen || suggestedDress) return;
    const timeout = setTimeout(() => {
      loadPickerDresses();
    }, 0);
    return () => clearTimeout(timeout);
  }, [isPickerOpen, loadPickerDresses, suggestedDress, user]);

  const bootSession = useCallback(async (isMounted: () => boolean = () => true) => {
    try {
      setIsBooting(true);
      setNetworkError('');
      const token = await loadToken();
      if (!token) {
        resetUserScopedState();
        setUser(null);
        return;
      }
      const profile = await myChoiceApi.profile();
      if (!isMounted()) return;
      resetUserScopedState();
      setUser(profile);
      const { nextDresses, nextPlans } = await refresh();
      if (!isMounted()) return;
      await openAutomaticSuggestion(nextDresses, nextPlans, profile._id);
    } catch (error) {
      if (isNetworkError(error)) {
        setNetworkError(error.message);
      } else {
        await clearToken();
        resetUserScopedState();
        setUser(null);
        setStatus(error instanceof Error ? error.message : 'Please sign in again.');
      }
    } finally {
      if (isMounted()) setIsBooting(false);
    }
  }, [openAutomaticSuggestion, refresh, resetUserScopedState]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => bootSession(() => isMounted));
    return () => {
      isMounted = false;
    };
  }, [bootSession]);

  useEffect(() => {
    async function finishGoogleLogin() {
      if (response?.type === 'error') {
        const description = response.params?.error_description ?? response.error?.message;
        setStatus(description ?? 'Google sign in was rejected. Check your OAuth client IDs and redirect URI.');
        return;
      }

      if (response?.type !== 'success') return;

      const idToken = response.params.id_token;
      if (!idToken) {
        setStatus('Google did not return an ID token. Check your OAuth client IDs.');
        return;
      }

      try {
        setIsBusy(true);
        const result = await myChoiceApi.googleSignIn(idToken);
        await saveToken(result.token);
        resetUserScopedState();
        setUser(result.user);
        const data = await refresh();
        await openAutomaticSuggestion(data.nextDresses, data.nextPlans, result.user._id);
        setStatus('');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Google sign in failed.');
      } finally {
        setIsBusy(false);
      }
    }

    finishGoogleLogin();
  }, [openAutomaticSuggestion, refresh, resetUserScopedState, response]);

  async function handleEmailAuth() {
    const cleanName = authName.trim();
    const cleanEmail = authEmail.trim().toLowerCase();

    if (!cleanEmail || !authPassword || (authMode === 'register' && !cleanName)) {
      setStatus(authMode === 'register' ? 'Enter your name, email, and password.' : 'Enter your email and password.');
      return;
    }

    try {
      setIsBusy(true);
      setStatus('');
      const result =
        authMode === 'register'
          ? await myChoiceApi.register(cleanName, cleanEmail, authPassword)
          : await myChoiceApi.login(cleanEmail, authPassword);
      await saveToken(result.token);
      resetUserScopedState();
      setUser(result.user);
      setAuthPassword('');
      const data = await refresh();
      await openAutomaticSuggestion(data.nextDresses, data.nextPlans, result.user._id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign in.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSignOut() {
    await clearToken();
    setUser(null);
    resetUserScopedState();
  }

  async function openDressPicker(dateKey: string, preferSuggestion = false) {
    setSelectedDate(dateKey);
    setPickerSearch('');
    setPickerCategory('all');
    setPickerPage(1);
    setPickerError('');
    setPickerDresses([]);
    setIsPickerOpen(true);

    const suggestion = preferSuggestion ? pickRandomSuggestion(dresses, plans, dateKey) : null;

    if (suggestion) {
      setSuggestedDress(suggestion);
    } else {
      setSuggestedDress(null);
    }

    if (!suggestion) {
      try {
        setIsPickerLoading(true);
        const response = await myChoiceApi.listDresses({ limit: PICKER_PAGE_SIZE, page: 1 });
        setPickerDresses(response.items);
        setPickerPage(response.page);
        setPickerPages(response.pages);
        setPickerTotal(response.total);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load dresses.';
        if (isNetworkError(error)) setPickerError(message);
        else setStatus(message);
      } finally {
        setIsPickerLoading(false);
      }
    }
  }

  async function openUploadPicker() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload your dress image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.86,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0]);
      setDressName('');
      setDressCategory('modern');
      setIsUploadOpen(true);
    }
  }

  async function handleUploadDress() {
    if (!dressName.trim() || !pickedImage) {
      setStatus('Add a dress name first.');
      return;
    }

    try {
      setIsBusy(true);
      setStatus('');
      const contentType = pickedImage.mimeType ?? 'image/jpeg';
      const imageUrl = await myChoiceApi.uploadDressImage(pickedImage.uri, contentType);
      await myChoiceApi.createDress(dressName.trim(), imageUrl, dressCategory);
      setDressName('');
      setDressCategory('modern');
      setPickedImage(null);
      setIsUploadOpen(false);
      await refresh();
      await loadOutfitDresses();
      setSection('outfits');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not upload the dress.');
    } finally {
      setIsBusy(false);
    }
  }

  async function assignDress(date: string, dress: Dress) {
    try {
      setIsBusy(true);
      setStatus('');
      const plan = await myChoiceApi.savePlan(date, dress._id);
      setPlans((current) =>
        [...current.filter((item) => item.date !== date), plan].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      );
      setSuggestedDress(null);
      setIsPickerOpen(false);
      setSelectedDate(date);
      setSection('calendar');
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save this outfit.');
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteDress(dress: Dress) {
    Alert.alert('Delete dress', `Delete ${dress.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsBusy(true);
            setStatus('');
            await myChoiceApi.deleteDress(dress._id);
            await refresh();
            await loadOutfitDresses();
            if (isPickerOpen) await loadPickerDresses();
          } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not delete this dress.');
          } finally {
            setIsBusy(false);
          }
        },
      },
    ]);
  }

  function openDressAction(dress: Dress, action: 'pause' | 'edit' | 'calendar' | 'delete') {
    if (action === 'delete') {
      deleteDress(dress);
      return;
    }

    setSelectedDressAction(dress);

    if (action === 'edit') {
      setEditName(dress.name);
      setEditCategory(dress.category ?? 'modern');
      setActionModal('edit');
      return;
    }

    if (action === 'pause') {
      setPauseDuration('week');
      setActionModal('pause');
      return;
    }

    setHistoryMonth(startOfMonth(new Date()));
    setActionModal('calendar');
    loadDressHistory(dress, startOfMonth(new Date()));
  }

  async function loadDressHistory(dress: Dress, month: Date) {
    const from = toDateKey(monthRange(month)[0]);
    const to = toDateKey(monthRange(month).at(-1) ?? month);
    try {
      setIsHistoryLoading(true);
      setHistoryError('');
      setHistoryPlans([]);
      const nextPlans = await myChoiceApi.listPlans(from, to, dress._id);
      setHistoryPlans(nextPlans);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load dress calendar.';
      if (isNetworkError(error)) setHistoryError(message);
      else setStatus(message);
    } finally {
      setIsHistoryLoading(false);
    }
  }

  async function confirmPauseSuggestion() {
    if (!selectedDressAction) return;

    try {
      setIsBusy(true);
      setStatus('');
      await myChoiceApi.pauseDressSuggestion(selectedDressAction._id, pauseDuration);
      setActionModal(null);
      await refresh();
      await loadOutfitDresses();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not update suggestion settings.');
    } finally {
      setIsBusy(false);
    }
  }

  async function saveDressEdit() {
    if (!selectedDressAction || !editName.trim()) {
      setStatus('Dress name is required.');
      return;
    }

    try {
      setIsBusy(true);
      setStatus('');
      await myChoiceApi.updateDress(selectedDressAction._id, { name: editName.trim(), category: editCategory });
      setActionModal(null);
      await refresh();
      await loadOutfitDresses();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save dress changes.');
    } finally {
      setIsBusy(false);
    }
  }

  function changeHistoryMonth(month: Date) {
    setHistoryMonth(month);
    if (selectedDressAction) loadDressHistory(selectedDressAction, month);
  }

  async function deleteCurrentPlan() {
    if (!currentPlan) return;

    try {
      setIsBusy(true);
      setStatus('');
      await myChoiceApi.deletePlan(currentPlan._id);
      setPlans((current) => current.filter((plan) => plan._id !== currentPlan._id));
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not delete this date outfit.');
    } finally {
      setIsBusy(false);
    }
  }

  function showRandomSuggestion() {
    const suggestion = pickRandomSuggestion(dresses, plans, todayKey());
    if (!suggestion) {
      setStatus('Upload a dress first so I can suggest one.');
      return;
    }
    setStatus('');
    setSelectedDate(todayKey());
    setSuggestedDress(suggestion);
  }

  function openDate(dateKey: string) {
    setSelectedDate(dateKey);
    setSection('calendar');
    if (!plans.some((plan) => plan.date === dateKey)) {
      openDressPicker(dateKey, true);
    }
  }

  if (isBooting) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <AppSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (networkError) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.networkPage}>
            <NetworkErrorPanel message={networkError} onRetry={() => bootSession()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        authMode={authMode}
        email={authEmail}
        isBusy={isBusy}
        isGoogleReady={!!request && isGoogleClientConfigured}
        name={authName}
        password={authPassword}
        status={status}
        onEmailAuth={handleEmailAuth}
        onGoogleAuth={async () => {
          setStatus('');
          if (!isGoogleClientConfigured) {
            setStatus(
              Platform.OS === 'android'
                ? 'Google sign in needs EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in the frontend .env file.'
                : 'Google web sign in needs a Web OAuth client ID. Your current web ID is an installed/native client, so Google blocks it as a loopback flow.'
            );
            return;
          }
          if (!request) {
            setStatus('Google sign in is still loading. Please try again in a moment.');
            return;
          }
          await promptAsync();
        }}
        onModeChange={(mode) => {
          setAuthMode(mode);
          setStatus('');
        }}
        onNameChange={setAuthName}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Welcome back
              </ThemedText>
              <ThemedText type="subtitle">{user.name}</ThemedText>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: mode === 'dark' }}
                accessibilityLabel="Toggle dark mode"
                onPress={toggleMode}
                style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]}>
                <SymbolView
                  name={mode === 'dark' ? { ios: 'sun.max', android: 'light_mode', web: 'light_mode' } : { ios: 'moon', android: 'dark_mode', web: 'dark_mode' }}
                  size={20}
                  tintColor={theme.text}
                />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={handleSignOut} style={[styles.iconButton, { backgroundColor: theme.backgroundSelected }]}>
                <SymbolView name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }} size={20} tintColor={theme.text} />
              </Pressable>
            </View>
          </View>

          <Animated.View
            style={{
              opacity: sectionProgress,
              transform: [
                {
                  translateY: sectionProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            }}>
            {section === 'today' && (
              <TodaySection
                dresses={dresses}
                todayPlan={todayPlan}
                onAddDress={() => {
                  setSection('outfits');
                  openUploadPicker();
                }}
                onOpenSuggestion={showRandomSuggestion}
              />
            )}

            {section === 'calendar' && (
              <CalendarSection
                currentPlan={currentPlan}
                hasDresses={dresses.length > 0}
                plannedByDate={plannedByDate}
                selectedDate={selectedDate}
                visibleMonth={visibleMonth}
                onMonthChange={setVisibleMonth}
                onDeletePlan={deleteCurrentPlan}
                onOpenDate={openDate}
                onSelectDress={() => openDressPicker(selectedDate)}
                onUploadDress={openUploadPicker}
              />
            )}

            {section === 'outfits' && (
              <OutfitsSection
                category={outfitCategory}
                dresses={outfitDresses}
                error={outfitsError}
                isLoading={isOutfitsLoading}
                page={outfitPage}
                pages={outfitPages}
                search={outfitSearch}
                total={outfitTotal}
                onCategoryChange={(category) => {
                  setOutfitCategory(category);
                  setOutfitPage(1);
                }}
                onDressOption={openDressAction}
                onPageChange={setOutfitPage}
                onSearchChange={(value) => {
                  setOutfitSearch(value);
                  setOutfitPage(1);
                }}
                onPickDress={(dress) => assignDress(selectedDate, dress)}
                onRetry={loadOutfitDresses}
                onUploadPress={openUploadPicker}
              />
            )}
          </Animated.View>

          {!!status && <ThemedText style={styles.statusText}>{status}</ThemedText>}
        </ScrollView>
        {!isAnyModalOpen && (
          <FloatingMenu
            section={section}
            onChange={setSection}
            backgroundColor={theme.backgroundElement}
          />
        )}
      </SafeAreaView>

      <DressPickerModal
        visible={isPickerOpen || !!suggestedDress}
        category={pickerCategory}
        date={selectedDate}
        dresses={pickerDresses}
        error={pickerError}
        isBusy={isBusy}
        isLoading={isPickerLoading}
        page={pickerPage}
        pages={pickerPages}
        suggestedDress={suggestedDress}
        search={pickerSearch}
        total={pickerTotal}
        onCategoryChange={(category) => {
          setPickerCategory(category);
          setPickerPage(1);
        }}
        onChangeSuggestion={() => {
          setSuggestedDress(null);
          setIsPickerOpen(true);
        }}
        onSearch={(value) => {
          setPickerSearch(value);
          setPickerPage(1);
        }}
        onClose={() => {
          setIsPickerOpen(false);
          setSuggestedDress(null);
        }}
        onPageChange={setPickerPage}
        onPick={(dress) => assignDress(selectedDate, dress)}
        onRetry={loadPickerDresses}
      />
      <UploadDressModal
        category={dressCategory}
        image={pickedImage}
        isBusy={isBusy}
        name={dressName}
        visible={isUploadOpen}
        onCancel={() => {
          setIsUploadOpen(false);
          setPickedImage(null);
          setDressName('');
          setDressCategory('modern');
        }}
        onCategoryChange={setDressCategory}
        onNameChange={setDressName}
        onSubmit={handleUploadDress}
      />
      <PauseSuggestionModal
        dress={selectedDressAction}
        duration={pauseDuration}
        isBusy={isBusy}
        visible={actionModal === 'pause'}
        onCancel={() => setActionModal(null)}
        onConfirm={confirmPauseSuggestion}
        onDurationChange={setPauseDuration}
      />
      <EditDressModal
        category={editCategory}
        isBusy={isBusy}
        name={editName}
        visible={actionModal === 'edit'}
        onCancel={() => setActionModal(null)}
        onCategoryChange={setEditCategory}
        onNameChange={setEditName}
        onSave={saveDressEdit}
      />
      <DressCalendarModal
        dress={selectedDressAction}
        error={historyError}
        isLoading={isHistoryLoading}
        month={historyMonth}
        plans={historyPlans}
        visible={actionModal === 'calendar'}
        onBack={() => setActionModal(null)}
        onMonthChange={changeHistoryMonth}
        onRetry={() => {
          if (selectedDressAction) loadDressHistory(selectedDressAction, historyMonth);
        }}
      />
    </ThemedView>
  );
}
