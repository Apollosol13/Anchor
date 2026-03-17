import { VerseCard } from "@/components/VerseCard";
import { verseApi } from "@/lib/api";
import { BibleVersionStorage } from "@/lib/storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [verse, setVerse] = useState<any>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bibleVersion, setBibleVersion] = useState("WEB");

  const loadData = async (forceReload = false) => {
    try {
      // Load user's preferred Bible version
      const savedVersion = await BibleVersionStorage.getVersion();
      console.log("📖 Loading verse with version:", savedVersion);

      // Reload if version changed or forced
      if (savedVersion !== bibleVersion || forceReload) {
        if (savedVersion !== bibleVersion) {
          console.log(
            "✨ Bible version changed from",
            bibleVersion,
            "to",
            savedVersion,
          );
        }
        setBibleVersion(savedVersion);
      }

      // Fetch verse of the day with the preferred version
      console.log("🔄 Fetching verse of the day...");
      const verse = await verseApi.getVerseOfTheDay({ version: savedVersion });
      console.log("✅ Received verse:", verse?.reference, verse?.version);
      setVerse(verse);
      // No background image - pure black background
      setBackgroundImage("");
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on initial mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (e.g., coming back from Settings)
  useFocusEffect(
    useCallback(() => {
      console.log("🏠 Home screen focused, reloading verse...");
      loadData(true); // Force reload when coming back to screen
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading verse of the day...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
            />
          }
        >
          <View style={styles.content}>
            <Text style={styles.title}>Verse of the Day</Text>
            <Text style={styles.subtitle}>Share God's Word Beautifully</Text>

            {verse && <VerseCard verse={verse} backgroundImage="" />}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9ca3af",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#9ca3af",
    marginBottom: 24,
  },
  selectorContainer: {
    marginTop: 24,
  },
});
