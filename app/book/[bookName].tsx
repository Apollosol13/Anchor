import { readingProgressApi } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSession } from "@/lib/auth-client";

const BOOKS_DATA: { [key: string]: number } = {
  // Old Testament
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Kings": 22,
  "2 Kings": 25,
  "1 Chronicles": 29,
  "2 Chronicles": 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  "Song of Solomon": 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  // New Testament
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  "1 Corinthians": 16,
  "2 Corinthians": 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  "1 Thessalonians": 5,
  "2 Thessalonians": 3,
  "1 Timothy": 6,
  "2 Timothy": 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  "1 Peter": 5,
  "2 Peter": 3,
  "1 John": 5,
  "2 John": 1,
  "3 John": 1,
  Jude: 1,
  Revelation: 22,
};

export default function BookScreen() {
  const params = useLocalSearchParams<{ bookName: string }>();
  const bookName =
    typeof params.bookName === "string"
      ? decodeURIComponent(params.bookName)
      : "";
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const chapters = BOOKS_DATA[bookName] || 0;
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(
    new Set(),
  );
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCompletedChapters = useCallback(async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const data = await readingProgressApi.getProgress(bookName);
      const completed = new Set<number>(
        data
          .map((item) => item.chapter)
          .filter((ch) => typeof ch === "number" && ch > 0),
      );
      setCompletedChapters(completed);
    } catch (error) {
      console.error("Error loading completed chapters:", error);
    } finally {
      setLoading(false);
    }
  }, [bookName, user?.id]);

  useEffect(() => {
    if (bookName) {
      loadCompletedChapters();
    }
  }, [bookName]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (bookName) {
        loadCompletedChapters();
      }
    }, [bookName, loadCompletedChapters]),
  );

  const handleChapterLongPress = (chapter: number) => {
    setSelectedChapter(chapter);
    setModalVisible(true);
  };

  const handleToggleCompletion = async () => {
    if (selectedChapter === null) return;

    try {
      if (!user?.id) {
        Alert.alert("Error", "Please sign in to track your progress");
        setModalVisible(false);
        return;
      }

      const isCompleted = completedChapters.has(selectedChapter);

      if (isCompleted) {
        await readingProgressApi.markIncomplete(bookName, selectedChapter);
        const newCompleted = new Set(completedChapters);
        newCompleted.delete(selectedChapter);
        setCompletedChapters(newCompleted);
        Alert.alert("Updated", "Chapter marked as incomplete");
      } else {
        await readingProgressApi.markComplete(bookName, selectedChapter);
        const newCompleted = new Set(completedChapters);
        newCompleted.add(selectedChapter);
        setCompletedChapters(newCompleted);
        Alert.alert(
          "Completed!",
          `${bookName} Chapter ${selectedChapter} marked as read`,
        );
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      Alert.alert("Error", "Failed to update progress");
    } finally {
      setModalVisible(false);
      setSelectedChapter(null);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedChapter(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{bookName}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.subtitle}>Select a Chapter</Text>
          <Text style={styles.hint}>💡 Long press to mark as complete</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            <View style={styles.chapterGrid}>
              {Array.from({ length: chapters }, (_, i) => i + 1)
                .filter((chapter) => !isNaN(chapter) && chapter > 0)
                .map((chapter) => {
                  const isCompleted = completedChapters.has(chapter);
                  return (
                    <TouchableOpacity
                      key={`chapter-${chapter}`}
                      style={[
                        styles.chapterButton,
                        isCompleted && styles.chapterButtonCompleted,
                      ]}
                      onPress={() =>
                        router.push(
                          `/chapter/${encodeURIComponent(bookName)}/${chapter}`,
                        )
                      }
                      onLongPress={() => handleChapterLongPress(chapter)}
                      delayLongPress={500}
                    >
                      <Text
                        style={[
                          styles.chapterText,
                          isCompleted && styles.chapterTextCompleted,
                        ]}
                      >
                        {chapter}
                      </Text>
                      {isCompleted && (
                        <View style={styles.checkmarkBadge}>
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#000000"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
        </ScrollView>

        {/* Completion Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Icon */}
              <View style={styles.modalIcon}>
                <Ionicons
                  name={
                    completedChapters.has(selectedChapter!)
                      ? "checkmark-circle"
                      : "book-outline"
                  }
                  size={56}
                  color={
                    completedChapters.has(selectedChapter!)
                      ? "#22c55e"
                      : "#3b82f6"
                  }
                />
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>
                {bookName} {selectedChapter}
              </Text>

              {/* Message */}
              <Text style={styles.modalMessage}>
                {completedChapters.has(selectedChapter!)
                  ? "Mark this chapter as incomplete?"
                  : "Mark as complete?"}
              </Text>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCloseModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    completedChapters.has(selectedChapter!)
                      ? styles.incompleteButton
                      : styles.confirmButton,
                  ]}
                  onPress={handleToggleCompletion}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      completedChapters.has(selectedChapter!)
                        ? "close-circle"
                        : "checkmark-circle"
                    }
                    size={20}
                    color={
                      completedChapters.has(selectedChapter!)
                        ? "#ffffff"
                        : "#000000"
                    }
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[
                      completedChapters.has(selectedChapter!)
                        ? styles.incompleteButtonText
                        : styles.confirmButtonText,
                    ]}
                  >
                    {completedChapters.has(selectedChapter!)
                      ? "Mark Incomplete"
                      : "Complete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 8,
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  chapterButton: {
    width: 60,
    height: 60,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    position: "relative",
  },
  chapterButtonCompleted: {
    backgroundColor: "#22c55e",
    borderColor: "#16a34a",
  },
  chapterText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  chapterTextCompleted: {
    color: "#000000",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
    width: "100%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalIcon: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  modalMessage: {
    fontSize: 17,
    color: "#9ca3af",
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 24,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1.5,
    borderColor: "#3a3a3a",
  },
  cancelButtonText: {
    color: "#9ca3af",
    fontSize: 17,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  incompleteButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  incompleteButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginRight: 8,
  },
});
