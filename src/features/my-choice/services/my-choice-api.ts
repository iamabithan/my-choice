import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import type { Dress, DressCategory, DressCategoryFilter, DressListResponse, PlannedOutfit, SuggestionPauseDuration, UploadTicket, User } from '../types';

const TOKEN_KEY = 'my-choice-token';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000')
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

const endpoints = {
  auth: {
    google: '/api/auth/google',
    login: '/api/auth/login',
    profile: '/api/auth/profile',
    register: '/api/auth/register',
  },
  dresses: '/api/dresses',
  planner: '/api/planner',
  uploads: '/api/uploads',
} as const;

let authToken: string | null = null;

export class NetworkError extends Error {
  constructor() {
    super('Could not connect to My Choice. Check your internet connection and try again.');
    this.name = 'NetworkError';
  }
}

export function isNetworkError(error: unknown) {
  return error instanceof NetworkError;
}

export async function loadToken() {
  authToken = await AsyncStorage.getItem(TOKEN_KEY);
  return authToken;
}

export async function saveToken(token: string) {
  authToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  authToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // Keep the default message when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const myChoiceApi = {
  baseUrl: API_BASE_URL,
  googleSignIn(idToken: string) {
    return request<{ token: string; user: User }>(endpoints.auth.google, {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },
  login(email: string, password: string) {
    return request<{ token: string; user: User }>(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register(name: string, email: string, password: string) {
    return request<{ token: string; user: User }>(endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  profile() {
    return request<User>(endpoints.auth.profile);
  },
  listDresses({
    category = 'all',
    limit = 200,
    page = 1,
    search = '',
  }: {
    category?: DressCategoryFilter;
    limit?: number;
    page?: number;
    search?: string;
  } = {}) {
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'all') params.set('category', category);
    return request<DressListResponse>(`${endpoints.dresses}?${params.toString()}`);
  },
  createDress(name: string, imageUrl: string, category: DressCategory) {
    return request<Dress>(endpoints.dresses, {
      method: 'POST',
      body: JSON.stringify({ name, imageUrl, category }),
    });
  },
  updateDress(id: string, data: { name: string; category: DressCategory }) {
    return request<Dress>(`${endpoints.dresses}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  pauseDressSuggestion(id: string, duration: SuggestionPauseDuration) {
    return request<Dress>(`${endpoints.dresses}/${id}/suggestion-pause`, {
      method: 'PATCH',
      body: JSON.stringify({ duration }),
    });
  },
  resumeDressSuggestion(id: string) {
    return request<Dress>(`${endpoints.dresses}/${id}/suggestion-pause`, {
      method: 'DELETE',
    });
  },
  createUpload(contentType: string) {
    return request<UploadTicket>(endpoints.uploads, {
      method: 'POST',
      body: JSON.stringify({ contentType }),
    });
  },
  listPlans(from: string, to: string, dressId?: string) {
    const params = new URLSearchParams({ from, to });
    if (dressId) params.set('dressId', dressId);
    return request<PlannedOutfit[]>(`${endpoints.planner}?${params.toString()}`);
  },
  savePlan(date: string, dressId: string) {
    return request<PlannedOutfit>(endpoints.planner, {
      method: 'POST',
      body: JSON.stringify({ date, dressId }),
    });
  },
  deleteDress(id: string) {
    return request<void>(`${endpoints.dresses}/${id}`, { method: 'DELETE' });
  },
  deletePlan(id: string) {
    return request<void>(`${endpoints.planner}/${id}`, { method: 'DELETE' });
  },
  async uploadDressImage(uri: string, contentType: string) {
    const ticket = await this.createUpload(contentType);
    const result = await FileSystem.uploadAsync(ticket.uploadUrl, uri, {
      httpMethod: 'PUT',
      headers: { 'Content-Type': contentType },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Image upload failed with status ${result.status}.`);
    }

    return ticket.imageUrl;
  },
};
