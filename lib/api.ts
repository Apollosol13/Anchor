import { Platform } from "react-native";
import { authClient } from "./auth-client";

const BASE_URL =
  Platform.OS === "web"
    ? "" // Relative paths on web (same origin)
    : process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081";

async function apiFetch<T = any>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const authHeaders: Record<string, string> = {};
  if (Platform.OS !== "web") {
    const cookie = authClient.getCookie();
    if (cookie) authHeaders.cookie = cookie;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Verse endpoints
export const verseApi = {
  getVerseOfTheDay: (params?: {
    version?: string;
    date?: string;
    timezone?: string;
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v) as [string, string][],
    ).toString();
    return apiFetch(`/api/verses/verse-of-day${qs ? `?${qs}` : ""}`);
  },
  getVerse: (reference: string, version?: string) => {
    const qs = version ? `?version=${version}` : "";
    return apiFetch(`/api/verses/${reference}${qs}`);
  },
  getChapter: (bookName: string, chapter: number, version?: string) => {
    const qs = version ? `?version=${version}` : "";
    return apiFetch(`/api/verses/chapter/${bookName}/${chapter}${qs}`);
  },
  searchVerses: (query: string, version?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (version) params.set("version", version);
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    return apiFetch(`/api/verses/search/${query}${qs ? `?${qs}` : ""}`);
  },
  getVersions: () => apiFetch("/api/verses/versions"),
};

// AI endpoints
export const aiApi = {
  explainVerse: (verse: string, reference: string, isPro = false) =>
    apiFetch("/api/ai/explain", {
      method: "POST",
      body: JSON.stringify({ verse, reference, isPro }),
    }),
  getRelatedVerses: (verse: string, isPro = false) =>
    apiFetch("/api/ai/related", {
      method: "POST",
      body: JSON.stringify({ verse, isPro }),
    }),
  getStudyQuestions: (verse: string, reference: string, isPro = false) =>
    apiFetch("/api/ai/study-questions", {
      method: "POST",
      body: JSON.stringify({ verse, reference, isPro }),
    }),
};

// Image endpoints
export const imageApi = {
  getPresets: (category?: string) => {
    const qs = category ? `?category=${category}` : "";
    return apiFetch(`/api/images/presets${qs}`);
  },
  getRandomPreset: () => apiFetch("/api/images/random"),
  deletePreset: (id: string) =>
    apiFetch(`/api/images/${id}`, { method: "DELETE" }),
};

// Favorites endpoints
export const favoritesApi = {
  getFavorites: (userId: string) => apiFetch(`/api/favorites/${userId}`),
  addFavorite: (data: {
    book: string;
    chapter: number;
    verse: number;
    version: string;
    text: string;
  }) =>
    apiFetch("/api/favorites", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeFavorite: (id: string) =>
    apiFetch(`/api/favorites/${id}`, { method: "DELETE" }),
};

// Audio endpoints
export const audioApi = {
  generateChapterAudio: (data: {
    verses: { number: number; text: string }[];
    bookName: string;
    chapter: number;
    version: string;
  }) =>
    apiFetch("/api/audio/generate-chapter-audio", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Notification endpoints
export const notificationApi = {
  registerToken: (token: string, platform: "ios" | "android") =>
    apiFetch("/api/notifications/register-token", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    }),
  getPreferences: () => apiFetch("/api/notifications/preferences"),
  updatePreferences: (prefs: Record<string, unknown>) =>
    apiFetch("/api/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(prefs),
    }),
  sendTest: () => apiFetch("/api/notifications/test", { method: "POST" }),
};

// Reading progress endpoints
export const readingProgressApi = {
  getProgress: (book?: string) => {
    const qs = book ? `?book=${encodeURIComponent(book)}` : "";
    return apiFetch<
      { id: string; book: string; chapter: number; completedAt: string }[]
    >(`/api/reading-progress${qs}`);
  },
  markComplete: (book: string, chapter: number) =>
    apiFetch("/api/reading-progress", {
      method: "POST",
      body: JSON.stringify({ book, chapter }),
    }),
  markIncomplete: (book: string, chapter: number) =>
    apiFetch("/api/reading-progress", {
      method: "DELETE",
      body: JSON.stringify({ book, chapter }),
    }),
};

// Account endpoints
export const accountApi = {
  deleteAccount: () =>
    apiFetch("/api/account", { method: "DELETE" }),
};

// Upload endpoints
export const uploadApi = {
  getPresignedUrl: (filename: string, contentType: string) =>
    apiFetch<{ uploadUrl: string; publicUrl: string }>("/api/uploads/presign", {
      method: "POST",
      body: JSON.stringify({ filename, contentType }),
    }),
  uploadToPresignedUrl: async (
    uploadUrl: string,
    file: Blob,
    contentType: string,
  ) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  },
};
