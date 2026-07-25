import { addDays, fromDateKey, toDateKey } from '@/lib/dates';

import type { Dress, PlannedOutfit } from '../types';

function startOfSuggestionWeek(dateKey: string) {
  return toDateKey(addDays(fromDateKey(dateKey), -6));
}

export function getDressesNotWornThisWeek(
  dresses: Dress[],
  plans: PlannedOutfit[],
  dateKey: string
) {
  const weekStart = startOfSuggestionWeek(dateKey);
  const now = Date.now();
  const wornDressIds = new Set(
    plans
      .filter((plan) => plan.date >= weekStart && plan.date < dateKey)
      .map((plan) => plan.dressId?._id)
  );

  return dresses.filter((dress) => {
    const isPaused =
      dress.suggestionPausedForever ||
      (dress.suggestionPausedUntil ? Date.parse(dress.suggestionPausedUntil) > now : false);
    return !isPaused && !wornDressIds.has(dress._id);
  });
}

export function pickRandomSuggestion(dresses: Dress[], plans: PlannedOutfit[], dateKey: string) {
  const eligibleDresses = getDressesNotWornThisWeek(dresses, plans, dateKey);
  const now = Date.now();
  const availableDresses = dresses.filter(
    (dress) =>
      !dress.suggestionPausedForever &&
      !(dress.suggestionPausedUntil ? Date.parse(dress.suggestionPausedUntil) > now : false)
  );
  const suggestionPool = eligibleDresses.length > 0 ? eligibleDresses : availableDresses;
  if (suggestionPool.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * suggestionPool.length);
  return suggestionPool[randomIndex];
}
