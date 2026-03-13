import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Bookmark {
  id: string;
  text: string;
  reference: string;
  version: string;
  created_at: string;
}

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    // TODO: Fetch from Supabase
    // For now, show empty state
    setLoading(false);
  };

  const deleteBookmark = (id: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete from Supabase
            setBookmarks(bookmarks.filter(b => b.id !== id));
          },
        },
      ]
    );
  };

  if (bookmarks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark-outline" size={80} color="#3a3a3a" />
        <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
        <Text style={styles.emptyText}>
          Bookmark your favorite verses to access them anytime
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {bookmarks.map((bookmark) => (
          <View key={bookmark.id} style={styles.bookmarkCard}>
            <View style={styles.bookmarkContent}>
              <Text style={styles.verseText}>{bookmark.text}</Text>
              <Text style={styles.reference}>
                {bookmark.reference} ({bookmark.version})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteBookmark(bookmark.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
