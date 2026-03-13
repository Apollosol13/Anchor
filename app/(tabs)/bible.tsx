import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BOOKS = [
  // Old Testament
  { name: 'Genesis', testament: 'Old', chapters: 50 },
  { name: 'Exodus', testament: 'Old', chapters: 40 },
  { name: 'Leviticus', testament: 'Old', chapters: 27 },
  { name: 'Numbers', testament: 'Old', chapters: 36 },
  { name: 'Deuteronomy', testament: 'Old', chapters: 34 },
  { name: 'Joshua', testament: 'Old', chapters: 24 },
  { name: 'Judges', testament: 'Old', chapters: 21 },
  { name: 'Ruth', testament: 'Old', chapters: 4 },
  { name: '1 Samuel', testament: 'Old', chapters: 31 },
  { name: '2 Samuel', testament: 'Old', chapters: 24 },
  { name: '1 Kings', testament: 'Old', chapters: 22 },
  { name: '2 Kings', testament: 'Old', chapters: 25 },
  { name: 'Psalms', testament: 'Old', chapters: 150 },
  { name: 'Proverbs', testament: 'Old', chapters: 31 },
  // New Testament
  { name: 'Matthew', testament: 'New', chapters: 28 },
  { name: 'Mark', testament: 'New', chapters: 16 },
  { name: 'Luke', testament: 'New', chapters: 24 },
  { name: 'John', testament: 'New', chapters: 21 },
  { name: 'Acts', testament: 'New', chapters: 28 },
  { name: 'Romans', testament: 'New', chapters: 16 },
  { name: '1 Corinthians', testament: 'New', chapters: 16 },
  { name: '2 Corinthians', testament: 'New', chapters: 13 },
  { name: 'Galatians', testament: 'New', chapters: 6 },
  { name: 'Ephesians', testament: 'New', chapters: 6 },
  { name: 'Philippians', testament: 'New', chapters: 4 },
  { name: 'Colossians', testament: 'New', chapters: 4 },
  { name: 'James', testament: 'New', chapters: 5 },
  { name: 'Revelation', testament: 'New', chapters: 22 },
];

export default function BibleScreen() {
  const [selectedTestament, setSelectedTestament] = useState<'Old' | 'New' | 'All'>('All');

  const filteredBooks = BOOKS.filter(
    book => selectedTestament === 'All' || book.testament === selectedTestament
  );

  return (
    <View style={styles.container}>
      {/* Testament Filter */}
      <View style={styles.filterContainer}>
        {['All', 'Old', 'New'].map((testament) => (
          <TouchableOpacity
            key={testament}
            style={[
              styles.filterButton,
              selectedTestament === testament && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedTestament(testament as any)}
          >
            <Text
              style={[
                styles.filterText,
                selectedTestament === testament && styles.filterTextActive,
              ]}
            >
              {testament === 'All' ? 'All Books' : `${testament} Testament`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Books List */}
      <ScrollView style={styles.booksList}>
        <View style={styles.booksGrid}>
          {filteredBooks.map((book, index) => (
            <TouchableOpacity
              key={index}
              style={styles.bookCard}
              onPress={() => {
                // TODO: Navigate to book reader
                console.log(`Opening ${book.name}`);
              }}
            >
              <View style={styles.bookIcon}>
                <Ionicons name="book" size={24} color="#ffffff" />
              </View>
              <Text style={styles.bookName}>{book.name}</Text>
              <Text style={styles.bookInfo}>{book.chapters} chapters</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#ffffff',
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000000',
  },
  booksList: {
    flex: 1,
  },
  booksGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bookCard: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  bookIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookInfo: {
    color: '#6b7280',
    fontSize: 12,
  },
});
