import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Verse endpoints
export const verseApi = {
  getVerseOfTheDay: () => api.get('/verses/verse-of-day'),
  getVerse: (reference: string, version?: string) => 
    api.get(`/verses/${reference}`, { params: { version } }),
  searchVerses: (query: string, version?: string, limit?: number) =>
    api.get(`/verses/search/${query}`, { params: { version, limit } }),
  getVersions: () => api.get('/verses/versions/list'),
};

// AI endpoints
export const aiApi = {
  explainVerse: (verse: string, reference: string) =>
    api.post('/ai/explain', { verse, reference }),
  getRelatedVerses: (verse: string, reference: string) =>
    api.post('/ai/related', { verse, reference }),
};

// Image endpoints
export const imageApi = {
  getPresets: (category?: string) =>
    api.get('/images/presets', { params: { category } }),
  getRandomPreset: () => api.get('/images/presets/random'),
};

// Favorites endpoints
export const favoritesApi = {
  getFavorites: (userId: string) => api.get(`/favorites/${userId}`),
  addFavorite: (data: any) => api.post('/favorites', data),
  removeFavorite: (id: string) => api.delete(`/favorites/${id}`),
};
