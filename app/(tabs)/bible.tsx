import { BibleVersionStorage } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BOOKS = [
  // Old Testament
  { name: "Genesis", testament: "Old", chapters: 50 },
  { name: "Exodus", testament: "Old", chapters: 40 },
  { name: "Leviticus", testament: "Old", chapters: 27 },
  { name: "Numbers", testament: "Old", chapters: 36 },
  { name: "Deuteronomy", testament: "Old", chapters: 34 },
  { name: "Joshua", testament: "Old", chapters: 24 },
  { name: "Judges", testament: "Old", chapters: 21 },
  { name: "Ruth", testament: "Old", chapters: 4 },
  { name: "1 Samuel", testament: "Old", chapters: 31 },
  { name: "2 Samuel", testament: "Old", chapters: 24 },
  { name: "1 Kings", testament: "Old", chapters: 22 },
  { name: "2 Kings", testament: "Old", chapters: 25 },
  { name: "1 Chronicles", testament: "Old", chapters: 29 },
  { name: "2 Chronicles", testament: "Old", chapters: 36 },
  { name: "Ezra", testament: "Old", chapters: 10 },
  { name: "Nehemiah", testament: "Old", chapters: 13 },
  { name: "Esther", testament: "Old", chapters: 10 },
  { name: "Job", testament: "Old", chapters: 42 },
  { name: "Psalms", testament: "Old", chapters: 150 },
  { name: "Proverbs", testament: "Old", chapters: 31 },
  { name: "Ecclesiastes", testament: "Old", chapters: 12 },
  { name: "Song of Solomon", testament: "Old", chapters: 8 },
  { name: "Isaiah", testament: "Old", chapters: 66 },
  { name: "Jeremiah", testament: "Old", chapters: 52 },
  { name: "Lamentations", testament: "Old", chapters: 5 },
  { name: "Ezekiel", testament: "Old", chapters: 48 },
  { name: "Daniel", testament: "Old", chapters: 12 },
  { name: "Hosea", testament: "Old", chapters: 14 },
  { name: "Joel", testament: "Old", chapters: 3 },
  { name: "Amos", testament: "Old", chapters: 9 },
  { name: "Obadiah", testament: "Old", chapters: 1 },
  { name: "Jonah", testament: "Old", chapters: 4 },
  { name: "Micah", testament: "Old", chapters: 7 },
  { name: "Nahum", testament: "Old", chapters: 3 },
  { name: "Habakkuk", testament: "Old", chapters: 3 },
  { name: "Zephaniah", testament: "Old", chapters: 3 },
  { name: "Haggai", testament: "Old", chapters: 2 },
  { name: "Zechariah", testament: "Old", chapters: 14 },
  { name: "Malachi", testament: "Old", chapters: 4 },
  // New Testament
  { name: "Matthew", testament: "New", chapters: 28 },
  { name: "Mark", testament: "New", chapters: 16 },
  { name: "Luke", testament: "New", chapters: 24 },
  { name: "John", testament: "New", chapters: 21 },
  { name: "Acts", testament: "New", chapters: 28 },
  { name: "Romans", testament: "New", chapters: 16 },
  { name: "1 Corinthians", testament: "New", chapters: 16 },
  { name: "2 Corinthians", testament: "New", chapters: 13 },
  { name: "Galatians", testament: "New", chapters: 6 },
  { name: "Ephesians", testament: "New", chapters: 6 },
  { name: "Philippians", testament: "New", chapters: 4 },
  { name: "Colossians", testament: "New", chapters: 4 },
  { name: "1 Thessalonians", testament: "New", chapters: 5 },
  { name: "2 Thessalonians", testament: "New", chapters: 3 },
  { name: "1 Timothy", testament: "New", chapters: 6 },
  { name: "2 Timothy", testament: "New", chapters: 4 },
  { name: "Titus", testament: "New", chapters: 3 },
  { name: "Philemon", testament: "New", chapters: 1 },
  { name: "Hebrews", testament: "New", chapters: 13 },
  { name: "James", testament: "New", chapters: 5 },
  { name: "1 Peter", testament: "New", chapters: 5 },
  { name: "2 Peter", testament: "New", chapters: 3 },
  { name: "1 John", testament: "New", chapters: 5 },
  { name: "2 John", testament: "New", chapters: 1 },
  { name: "3 John", testament: "New", chapters: 1 },
  { name: "Jude", testament: "New", chapters: 1 },
  { name: "Revelation", testament: "New", chapters: 22 },
];

// Helper function to get the first letter for display
const getBookInitial = (bookName: string): string => {
  // For books starting with numbers (e.g., "1 Samuel"), get the first letter of the main word
  const parts = bookName.split(" ");
  if (parts.length > 1 && /^\d/.test(parts[0])) {
    return parts[1].charAt(0).toUpperCase();
  }
  return bookName.charAt(0).toUpperCase();
};

export default function BibleScreen() {
  const router = useRouter();
  const [selectedTestament, setSelectedTestament] = useState<
    "Old" | "New" | "All"
  >("All");
  const [bibleVersion, setBibleVersion] = useState("WEB");

  const filteredBooks = BOOKS.filter(
    (book) =>
      selectedTestament === "All" || book.testament === selectedTestament,
  );

  // Load Bible version when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadVersion = async () => {
        const version = await BibleVersionStorage.getVersion();
        setBibleVersion(version);
      };
      loadVersion();
    }, []),
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Holy Bible</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      {/* Testament Filter */}
      <View style={styles.filterContainer}>
        {["All", "Old", "New"].map((testament) => (
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
              {testament === "All" ? "All Books" : `${testament} Testament`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bible Version Display */}
      <View style={styles.versionContainer}>
        <Ionicons name="book-outline" size={16} color="#6b7280" />
        <Text style={styles.versionText}>Reading: {bibleVersion}</Text>
      </View>

      {/* Books List */}
      <ScrollView style={styles.booksList} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.booksGrid}>
          {filteredBooks.map((book, index) => (
            <TouchableOpacity
              key={index}
              style={styles.bookCard}
              onPress={() =>
                router.push(`/book/${encodeURIComponent(book.name)}`)
              }
              activeOpacity={0.7}
            >
              <View style={styles.bookIcon}>
                <Text style={styles.bookInitial}>
                  {getBookInitial(book.name)}
                </Text>
              </View>
              <View style={styles.bookTextContainer}>
                <Text style={styles.bookName}>{book.name}</Text>
                <Text style={styles.bookInfo}>{book.chapters} chapters</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#3a3a3a"
                style={styles.chevron}
              />
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
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#ffffff",
  },
  filterText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#000000",
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
    gap: 8,
  },
  versionText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  booksList: {
    flex: 1,
  },
  booksGrid: {
    padding: 20,
    gap: 16,
  },
  bookCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f1f1f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  bookInitial: {
    fontSize: 32,
    fontWeight: "300",
    color: "#ffffff",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
    letterSpacing: 1,
  },
  bookName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  bookInfo: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  bookTextContainer: {
    flex: 1,
  },
  chevron: {
    marginLeft: "auto",
  },
});
