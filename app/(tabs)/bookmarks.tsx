import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { favoritesApi } from '@/lib/api';
import { useSession } from '@/lib/auth-client';

interface Bookmark {
  id: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  createdAt: string;
}

export default function BookmarksScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      loadBookmarks();
    }, [user?.id])
  );

  const loadBookmarks = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await favoritesApi.getFavorites(user.id);
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      Alert.alert('Error', 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = (bookmark: Bookmark) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesApi.removeFavorite(bookmark.id);
              setBookmarks(bookmarks.filter(b => b.id !== bookmark.id));
            } catch (error) {
              console.error('Error deleting bookmark:', error);
              Alert.alert('Error', 'Failed to delete bookmark');
            }
          },
        },
      ]
    );
  };

  const navigateToChapter = (bookmark: Bookmark) => {
    router.push(`/chapter/${encodeURIComponent(bookmark.book)}/${bookmark.chapter}`);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookmarks</Text>
      </View>
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={80} color="#3a3a3a" />
          <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptyText}>
            Tap verses while reading to bookmark them
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.content}>
            {bookmarks.map((bookmark) => (
              <TouchableOpacity
                key={bookmark.id}
                style={styles.bookmarkCard}
                onPress={() => navigateToChapter(bookmark)}
                activeOpacity={0.7}
              >
                <View style={styles.bookmarkContent}>
                  <Text style={styles.verseText}>{bookmark.text}</Text>
                  <Text style={styles.reference}>
                    {bookmark.book} {bookmark.chapter}:{bookmark.verse} ({bookmark.version})
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteBookmark(bookmark);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  content: {
    padding: 16,
  },
  bookmarkCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  bookmarkContent: {
    flex: 1,
  },
  verseText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 8,
  },
  reference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
});
