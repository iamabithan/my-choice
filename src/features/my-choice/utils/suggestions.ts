import { addDays, fromDateKey, toDateKey } from '@/lib/dates';

import type { Dress, PlannedOutfit } from '../types';

function isPausedForSuggestion(dress: Dress, now: number) {
  return (
    dress.suggestionPausedForever ||
    (dress.suggestionPausedUntil ? Date.parse(dress.suggestionPausedUntil) > now : false)
  );
}

export function getAvailableDresses(dresses: Dress[]) {
  const now = Date.now();
  return dresses.filter((dress) => !isPausedForSuggestion(dress, now));
}

export function getDressesNotWornYet(
  dresses: Dress[],
  plans: PlannedOutfit[],
  dateKey: string
) {
  const availableDresses = getAvailableDresses(dresses);
  const wornDressIds = new Set(
    plans
      .filter((plan) => plan.date < dateKey)
      .map((plan) => plan.dressId?._id)
  );

  return availableDresses.filter((dress) => !wornDressIds.has(dress._id));
}

function avoidPreviousDayCategory(
  dresses: Dress[],
  plans: PlannedOutfit[],
  dateKey: string
) {
  const previousDateKey = toDateKey(addDays(fromDateKey(dateKey), -1));
  const previousCategory = plans.find((plan) => plan.date === previousDateKey)?.dressId?.category;

  if (!previousCategory) return dresses;

  const rotatedDresses = dresses.filter((dress) => dress.category !== previousCategory);
  return rotatedDresses.length > 0 ? rotatedDresses : dresses;
}

export function pickRandomSuggestion(dresses: Dress[], plans: PlannedOutfit[], dateKey: string) {
  const availableDresses = getAvailableDresses(dresses);
  const unwornDresses = getDressesNotWornYet(dresses, plans, dateKey);
  const basePool = unwornDresses.length > 0 ? unwornDresses : availableDresses;
  const suggestionPool = avoidPreviousDayCategory(basePool, plans, dateKey);
  if (suggestionPool.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * suggestionPool.length);
  return suggestionPool[randomIndex];
}
