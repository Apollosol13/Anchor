import { verseApi } from "@/lib/api";
import { BibleVersionStorage } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchResult {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
}

// Detect if input looks like a Bible reference:
// "John 3:16", "romans 12:2", "1 Cor 13:4", "1 corinthians 13:4"
const REFERENCE_REGEX =
  /^(\d\s+[a-zA-Z]+(?:\s+[a-zA-Z]+)*|[a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(\d+):(\d+)$/i;

const capitalize = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const parseReference = (
  input: string,
): { book: string; chapter: number; verse: number } | null => {
  const match = input.trim().match(REFERENCE_REGEX);
  if (!match) return null;
  return {
    book: capitalize(match[1].trim()),
    chapter: parseInt(match[2], 10),
    verse: parseInt(match[3], 10),
  };
};

// Truncate verse text for display
const truncate = (text: string, max = 120) =>
  text.length > max ? text.slice(0, max).trimEnd() + "…" : text;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const version = await BibleVersionStorage.getVersion();

      // If it's a direct reference (e.g. "Romans 12:2"), navigate straight to the verse
      const ref = parseReference(trimmed);
      if (ref) {
        setLoading(false);
        router.push(
          `/chapter/${encodeURIComponent(ref.book)}/${ref.chapter}?highlightVerse=${ref.verse}`,
        );
        return;
      }

      // Keyword search
      const res = await verseApi.searchVerses(trimmed, version, 20);
      if (!res) {
        setResults([]);
        setSearched(true);
        return;
      }
      const data: any[] =
        res?.verses ??
        res?.results ??
        (Array.isArray(res) ? res : []);
      if (!Array.isArray(data)) {
        setResults([]);
        setSearched(true);
        return;
      }
      const mapped: SearchResult[] = data
        .filter((item: any) => item && item.reference)
        .map((item: any) => ({
          reference:
            item.reference ?? `${item.book} ${item.chapter}:${item.verse}`,
          text: (item.text ?? "").replace(/<[^>]*>/g, "").trim(),
          book: item.book ?? "",
          chapter: item.chapter ?? 1,
          verse: item.verse ?? 1,
        }));
      setResults(mapped);
      setSearched(true);
    } catch (err: any) {
      setError("Search failed. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(text), 500);
  };

  const handleSubmit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    Keyboard.dismiss();
    doSearch(query);
  };

  const handleResultPress = (item: SearchResult) => {
    Keyboard.dismiss();
    // Reference format: "Romans 12:2" or "1 Corinthians 13:4"
    // Last segment is "chapter:verse", everything before is book name
    const lastSpace = item.reference.lastIndexOf(" ");
    const bookName = item.reference.slice(0, lastSpace).trim();
    const chapterVerse = item.reference.slice(lastSpace + 1); // "12:2"
    const chapterNum = chapterVerse.split(":")[0];
    router.push(`/chapter/${encodeURIComponent(bookName)}/${chapterNum}`);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError(null);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultReference}>{item.reference}</Text>
        <Ionicons name="chevron-forward" size={16} color="#4b5563" />
      </View>
      <Text style={styles.resultText}>{truncate(item.text)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#6b7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder='Search verses or type "John 3:16"'
          placeholderTextColor="#4b5563"
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#4b5563" />
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => doSearch(query)}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={48} color="#2a2a2a" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try different keywords or check the reference format (e.g. John
            3:16)
          </Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.centered}>
          <Ionicons name="book-outline" size={48} color="#1a1a1a" />
          <Text style={styles.hintTitle}>Search the Bible</Text>
          <Text style={styles.hintText}>
            Search by keyword (e.g. "love", "faith") or jump to a verse directly
            (e.g. "John 3:16")
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    backgroundColor: "#111111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#ffffff",
    fontSize: 16,
    ...Platform.select({ android: { paddingVertical: 0 } }),
  },
  clearButton: {
    padding: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  hintTitle: {
    color: "#4b5563",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  hintText: {
    color: "#374151",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "#111111",
  },
  resultCard: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  resultReference: {
    fontSize: 15,
    fontWeight: "700",
    color: "#34d399",
  },
  resultText: {
    fontSize: 15,
    color: "#d1d5db",
    lineHeight: 22,
  },
});
