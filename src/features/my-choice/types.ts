import type { ComponentProps } from 'react';
import type { SymbolView } from 'expo-symbols';

export type User = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export type Dress = {
  _id: string;
  name: string;
  category?: DressCategory;
  imageUrl: string;
  suggestionPausedForever?: boolean;
  suggestionPausedUntil?: string;
  createdAt?: string;
};

export type PlannedOutfit = {
  _id: string;
  date: string;
  dressId: Dress;
};

export type UploadTicket = {
  uploadUrl: string;
  imageUrl: string;
};

export type DressListResponse = {
  items: Dress[];
  page: number;
  pages: number;
  total: number;
};

export type Section = 'today' | 'calendar' | 'outfits';
export type AuthMode = 'login' | 'register';
export type DressCategory = 'traditional' | 'modern';
export type DressCategoryFilter = DressCategory | 'all';
export type SuggestionPauseDuration = 'week' | 'month' | 'year' | 'never';
export type SymbolName = ComponentProps<typeof SymbolView>['name'];
