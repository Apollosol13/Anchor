import { ShareModal } from "@/components/ShareModal";
import { audioApi, verseApi, favoritesApi, readingProgressApi } from "@/lib/api";
import { getNextChapter, getPreviousChapter } from "@/lib/constants/bibleBooks";
import { BibleVersionStorage } from "@/lib/storage";
import { useSession } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

export default function ChapterScreen() {
  const params = useLocalSearchParams<{
    bookName: string;
    chapter: string;
    highlightVerse?: string;
  }>();
  const bookName =
    typeof params.bookName === "string"
      ? decodeURIComponent(params.bookName)
      : "";
  const chapter = params.chapter;
  const highlightVerseParam = params.highlightVerse
    ? parseInt(params.highlightVerse, 10)
    : null;
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<any>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [tempBackgroundImage, setTempBackgroundImage] = useState("");
  const [tempPreset, setTempPreset] = useState<any>(null);
  const [highlightedVerses, setHighlightedVerses] = useState<Set<number>>(
    new Set(),
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [bibleVersion, setBibleVersion] = useState("WEB");
  const playerRef = useRef<AudioPlayer | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [currentlyReadingVerse, setCurrentlyReadingVerse] = useState<
    number | null
  >(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const verseCardRef = useRef<View>(null);
  const polaroidCardRef = useRef<View>(null);
  const tempPresetRef = useRef<any>(null);
  const captureReadyResolve = useRef<(() => void) | null>(null);
  const imageLoadResolveRef = useRef<(() => void) | null>(null);
  const swipePosition = useRef(new Animated.Value(0)).current;

  const waitForImageLoad = (
    hasImage: boolean,
    timeoutMs = 3000,
  ): Promise<void> => {
    if (!hasImage) {
      return new Promise((resolve) => setTimeout(resolve, 300));
    }
    return new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        imageLoadResolveRef.current = null;
        resolve();
      }, timeoutMs);
      imageLoadResolveRef.current = () => {
        clearTimeout(timer);
        imageLoadResolveRef.current = null;
        resolve();
      };
    });
  };

  // Helper function to clean verse text by removing ALL bracketed numbers
  const cleanVerseText = (text: string) => {
    return text.replace(/\[\d+\]/g, "").trim();
  };

  // Helper function to render text with stroke
  const renderStrokedText = (text: string, style: any) => {
    if (strokeEnabled) {
      return (
        <View style={{ position: "relative" }}>
          {/* Black outline layers */}
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: -3,
                left: -3,
              },
            ]}
          >
            {text}
          </Text>
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: -3,
                left: 0,
              },
            ]}
          >
            {text}
          </Text>
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: -3,
                left: 3,
              },
            ]}
          >
            {text}
          </Text>
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: 0,
                left: -3,
              },
            ]}
          >
            {text}
          </Text>
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: 0,
                left: 3,
              },
            ]}
          >
            {text}
          </Text>
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: 3,
                left: -3,
              },
            ]}
          >
            {text}
          </Text>
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: 3,
                left: 0,
              },
            ]}
          >
            {text}
          </Text>
          <Text
            style={[
              style,
              {
                color: "#000000",
                position: "absolute",
                fontWeight: "900",
                top: 3,
                left: 3,
              },
            ]}
          >
            {text}
          </Text>
          {/* White text on top */}
          <Text style={[style, { color: "#ffffff", fontWeight: "700" }]}>
            {text}
          </Text>
        </View>
      );
    }
    return (
      <Text style={[style, { color: "#ffffff", fontWeight: "700" }]}>
        {text}
      </Text>
    );
  };
  const scrollViewRef = useRef<ScrollView>(null);
  const verseLayoutsRef = useRef<Record<number, number>>({});
  const visualGuideInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to and highlight a specific verse when coming from search
  useEffect(() => {
    if (!highlightVerseParam || loading || verses.length === 0) return;
    setHighlightedVerses(new Set([highlightVerseParam]));
    // Wait a tick for layouts to be measured
    const timer = setTimeout(() => {
      const y = verseLayoutsRef.current[highlightVerseParam];
      if (y !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 80),
          animated: true,
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightVerseParam, loading, verses]);

  // Signal that the capture card has rendered with the correct preset
  useEffect(() => {
    if (
      isSharing &&
      tempPreset &&
      tempBackgroundImage &&
      captureReadyResolve.current
    ) {
      // State is rendered - signal that capture can proceed
      captureReadyResolve.current();
      captureReadyResolve.current = null;
    }
  }, [isSharing, tempPreset, tempBackgroundImage]);

  // Load saved playback speed preference
  useEffect(() => {
    const loadSpeedPreference = async () => {
      try {
        const savedSpeed = await BibleVersionStorage.getPlaybackSpeed();
        if (savedSpeed) {
          setPlaybackRate(savedSpeed);
        }
      } catch (error) {
        console.error("Error loading playback speed:", error);
      }
    };
    loadSpeedPreference();
  }, []);

  useEffect(() => {
    // Clean up audio when navigating to a new chapter
    const cleanupAudio = async () => {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
      if (visualGuideInterval.current) {
        clearInterval(visualGuideInterval.current);
        visualGuideInterval.current = null;
      }
      setIsPlaying(false);
      setIsPaused(false);
      setPlaybackPosition(0);
      setCurrentlyReadingVerse(null);
      setIsLoadingAudio(false);
    };

    cleanupAudio();
    loadChapter();
    loadBookmarks();
  }, [bookName, chapter]);

  // Auto-play next chapter after audio completes and navigates
  useEffect(() => {
    if (shouldAutoPlay && verses.length > 0 && !loading && !isLoadingAudio) {
      console.log(`🎙️ Auto-starting audio for ${bookName} ${chapter}`);
      setShouldAutoPlay(false);
      // Small delay to ensure previous audio is fully cleaned up
      const timer = setTimeout(() => {
        handleListenToChapter();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoPlay, verses, loading, isLoadingAudio, bookName, chapter]);

  // Reload chapter when screen comes into focus (e.g., coming back from Settings)
  useFocusEffect(
    useCallback(() => {
      loadChapter();
    }, [bookName, chapter]),
  );

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderMove: (_, gestureState) => {
        // Update swipe position
        swipePosition.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 100;

        if (gestureState.dx > swipeThreshold) {
          // Swiped right - go to previous chapter
          handlePreviousChapter();
        } else if (gestureState.dx < -swipeThreshold) {
          // Swiped left - go to next chapter
          handleNextChapter();
        }

        // Reset swipe position
        Animated.spring(swipePosition, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        // Reset swipe position if gesture is interrupted
        Animated.spring(swipePosition, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const markCurrentChapterComplete = async () => {
    if (!user?.id) return;
    try {
      await readingProgressApi.markComplete(bookName, parseInt(chapter));
    } catch (err) {
      console.error("Error marking chapter complete:", err);
    }
  };

  const handleNextChapter = () => {
    const nextChapter = getNextChapter(bookName, parseInt(chapter));
    if (nextChapter) {
      markCurrentChapterComplete();
      router.replace(
        `/chapter/${encodeURIComponent(nextChapter.book)}/${nextChapter.chapter}`,
      );
    }
  };

  const handlePreviousChapter = () => {
    const previousChapter = getPreviousChapter(bookName, parseInt(chapter));
    if (previousChapter) {
      markCurrentChapterComplete();
      router.replace(
        `/chapter/${encodeURIComponent(previousChapter.book)}/${previousChapter.chapter}`,
      );
    }
  };

  const loadChapter = async () => {
    try {
      // Load user's preferred Bible version
      const savedVersion = await BibleVersionStorage.getVersion();
      setBibleVersion(savedVersion);

      // Fetch chapter with the preferred version
      const response = await verseApi.getChapter(
        bookName,
        parseInt(chapter),
        savedVersion,
      );

      // apiFetch returns JSON directly (no .data wrapper)
      if (response?.verses && Array.isArray(response.verses)) {
        setVerses(response.verses);
      } else if (response?.text) {
        // Fallback: Parse old text format
        const text = response.text;
        const verseMatches = text
          .split(/\[(\d+)\]/)
          .filter((v: string) => v.trim());
        const parsedVerses = [];

        for (let i = 0; i < verseMatches.length; i += 2) {
          const verseNumber = parseInt(verseMatches[i]);
          const verseText = verseMatches[i + 1];

          if (
            !isNaN(verseNumber) &&
            verseNumber > 0 &&
            verseText &&
            verseText.trim()
          ) {
            parsedVerses.push({
              number: verseNumber,
              text: verseText.trim(),
            });
          }
        }

        setVerses(parsedVerses);
      } else {
        console.error("Unknown response format:", response);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading chapter:", error);
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      if (!user?.id) return;

      const favorites = await favoritesApi.getFavorites(user.id);
      const chapterNum = parseInt(chapter);
      const matching = favorites.filter(
        (f: any) => f.book === bookName && f.chapter === chapterNum,
      );
      if (matching.length > 0) {
        const bookmarkedVerses = new Set<number>(
          matching.map((item: any) => item.verse),
        );
        setHighlightedVerses(bookmarkedVerses);
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  // Audio functionality
  const handleListenToChapter = async () => {
    if (isPaused && playerRef.current) {
      playerRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    if (isPlaying && playerRef.current) {
      playerRef.current.pause();
      setPlaybackPosition(playerRef.current.currentTime * 1000);
      setIsPlaying(false);
      setIsPaused(true);
      return;
    }

    // Start new audio
    setIsLoadingAudio(true);

    try {
      const response = await audioApi.generateChapterAudio({
        verses: verses.map((v) => ({ number: v.number, text: v.text })),
        bookName,
        chapter: parseInt(chapter),
        version: bibleVersion,
      });

      const { audioUrl, duration } = response;

      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "duckOthers",
      });

      // Clean up previous player if any
      if (playerRef.current) {
        playerRef.current.remove();
      }

      const player = createAudioPlayer({ uri: audioUrl });
      player.playbackRate = playbackRate;

      // Listen for completion
      const sub = player.addListener("playbackStatusUpdate", (status) => {
        if (status.playing === false && status.currentTime >= status.duration && status.duration > 0) {
          handleAudioComplete();
        }
      });

      player.play();
      playerRef.current = player;

      setIsPlaying(true);
      setIsPaused(false);
      setPlaybackPosition(0);
      setIsLoadingAudio(false);

      // Start visual guide with actual duration (adjusted for playback rate)
      const adjustedDuration = duration / playbackRate;
      startVisualGuide(verses.length, adjustedDuration);
    } catch (error: any) {
      console.error("Error playing chapter:", error);
      Alert.alert(
        "Audio Error",
        error.message || "Failed to generate audio. Please try again.",
      );
      setIsLoadingAudio(false);
    }
  };

  const stopAudio = async () => {
    if (playerRef.current) {
      playerRef.current.remove();
      playerRef.current = null;
    }
    if (visualGuideInterval.current) {
      clearInterval(visualGuideInterval.current);
      visualGuideInterval.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackPosition(0);
    setCurrentlyReadingVerse(null);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setPlaybackRate(newSpeed);

    // If audio is currently playing, update speed on the fly
    if (playerRef.current) {
      playerRef.current.playbackRate = newSpeed;
    }

    BibleVersionStorage.setPlaybackSpeed(newSpeed);
    setShowSpeedModal(false);
  };

  const startVisualGuide = (verseCount: number, durationSeconds: number) => {
    // Calculate time per verse based on actual audio duration
    const timePerVerse = (durationSeconds * 1000) / verseCount;
    let currentVerse = 1;

    console.log(
      `📖 Starting visual guide: ${verseCount} verses over ${durationSeconds}s (${Math.round(timePerVerse / 1000)}s per verse)`,
    );

    // Clear any existing interval
    if (visualGuideInterval.current) {
      clearInterval(visualGuideInterval.current);
    }

    visualGuideInterval.current = setInterval(() => {
      if (!isPlaying || currentVerse > verseCount) {
        if (visualGuideInterval.current) {
          clearInterval(visualGuideInterval.current);
          visualGuideInterval.current = null;
        }
        setCurrentlyReadingVerse(null);
        return;
      }

      setCurrentlyReadingVerse(currentVerse);

      // Auto-scroll to the current verse
      scrollViewRef.current?.scrollTo({
        y: (currentVerse - 1) * 80, // Approximate verse height
        animated: true,
      });

      currentVerse++;
    }, timePerVerse);
  };

  const handleAudioComplete = async () => {
    console.log(`✅ Audio playback complete for ${bookName} ${chapter}`);

    // Mark chapter as complete
    if (user?.id) {
      readingProgressApi
        .markComplete(bookName, parseInt(chapter))
        .catch((err) => console.error("Error marking chapter complete:", err));
    }

    // Fully stop and clean up current audio
    await stopAudio();

    // Small delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Automatically move to next chapter and start playing
    const nextChapter = getNextChapter(bookName, parseInt(chapter));
    if (nextChapter) {
      console.log(
        `📖 Navigating to next chapter: ${nextChapter.book} ${nextChapter.chapter}`,
      );
      setShouldAutoPlay(true); // Set flag to auto-start audio
      router.replace(
        `/chapter/${encodeURIComponent(nextChapter.book)}/${nextChapter.chapter}`,
      );
    } else {
      console.log("📖 Reached end of Bible");
      Alert.alert("Bible Complete! 🎉", "You've reached the end of the Bible!");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
      if (visualGuideInterval.current) {
        clearInterval(visualGuideInterval.current);
      }
    };
  }, []);

  const handleVerseTap = async (verse: any) => {
    const isHighlighted = highlightedVerses.has(verse.number);

    try {
      if (isHighlighted) {
        // Remove highlight and from bookmarks
        const newHighlighted = new Set(highlightedVerses);
        newHighlighted.delete(verse.number);
        setHighlightedVerses(newHighlighted);

        // Remove bookmark via API
        if (user?.id) {
          try {
            const favorites = await favoritesApi.getFavorites(user.id);
            const fav = favorites.find(
              (f: any) =>
                f.book === bookName &&
                f.chapter === parseInt(chapter) &&
                f.verse === verse.number,
            );
            if (fav) await favoritesApi.removeFavorite(fav.id);
          } catch (err) {
            console.error("Error removing bookmark:", err);
          }
        }
      } else {
        // Add highlight and bookmark
        const newHighlighted = new Set(highlightedVerses);
        newHighlighted.add(verse.number);
        setHighlightedVerses(newHighlighted);

        // Save bookmark via API
        try {
          await favoritesApi.addFavorite({
            book: bookName,
            chapter: parseInt(chapter),
            verse: verse.number,
            version: bibleVersion,
            text: verse.text,
          });
        } catch (err) {
          console.error("Error saving bookmark:", err);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleVerseLongPress = (verse: any) => {
    setSelectedVerse(verse);
    setShareModalVisible(true);
  };

  const handleAskChat = () => {
    if (selectedVerse) {
      // Navigate to Anchor tab with verse pre-filled
      router.push({
        pathname: "/(tabs)/anchor",
        params: {
          prefilledText: `Explain this verse: "${selectedVerse.text}" (${bookName} ${chapter}:${selectedVerse.number})`,
        },
      });
      setSelectedVerse(null);
      setShareModalVisible(false);
    }
  };

  const handleShare = async (
    imageUrl: string | null,
    strokeEnabledParam?: boolean,
    textPositionParam?: { x: number; y: number },
    overlayEnabledParam?: boolean,
    preset?: any,
  ) => {
    console.log("🔥 Chapter handleShare RECEIVED:");
    console.log("🔥 imageUrl:", imageUrl);
    console.log("🔥 preset:", JSON.stringify(preset, null, 2));

    const imageToUse = imageUrl || "";
    // Use explicit _isPolaroid flag from ShareModal (most reliable) + fallback checks
    const isPolaroid =
      preset?._isPolaroid ||
      preset?.is_frame_template ||
      preset?.name === "Polaroid";
    console.log(
      "🔥 Is Polaroid?",
      isPolaroid,
      "_isPolaroid:",
      preset?._isPolaroid,
      "is_frame_template:",
      preset?.is_frame_template,
      "name:",
      preset?.name,
    );

    // Store refs SYNCHRONOUSLY before any await
    tempPresetRef.current = preset || null;

    // Always explicitly set overlay — never rely on previous state
    setOverlayEnabled(overlayEnabledParam ?? false);
    setStrokeEnabled(strokeEnabledParam ?? true);
    setTextPosition(textPositionParam ?? { x: 0, y: 0 });
    setIsSharing(true);
    setImageLoaded(false);
    if (preset) setTempPreset(preset);

    const loadPromise = waitForImageLoad(!!imageToUse);
    setTempBackgroundImage(imageToUse);

    await loadPromise;
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const refToCapture = isPolaroid ? polaroidCardRef : verseCardRef;
      if (!refToCapture.current) {
        console.error("❌ Capture ref is null");
        return;
      }
      console.log(
        "📸 Capturing",
        isPolaroid ? "POLAROID" : "REGULAR",
        "image...",
      );
      const uri = await captureRef(refToCapture, {
        format: "png",
        quality: 1,
      });

      console.log("✅ Captured image:", uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Verse",
        });
      } else {
        Alert.alert("Sharing not available");
      }
    } catch (error) {
      console.error("❌ Error sharing:", error);
      Alert.alert("Error", "Failed to share verse");
    } finally {
      tempPresetRef.current = null;
      setTempBackgroundImage("");
      setTempPreset(null);
      setSelectedVerse(null);
      setImageLoaded(false);
      setIsSharing(false);
      setOverlayEnabled(false);
      setStrokeEnabled(true);
    }
  };

  const handleSave = async (
    imageUrl: string | null,
    strokeEnabledParam?: boolean,
    textPositionParam?: { x: number; y: number },
    overlayEnabledParam?: boolean,
    preset?: any,
  ) => {
    const imageToUse = imageUrl || "";
    const isPolaroid =
      preset?._isPolaroid ||
      preset?.is_frame_template ||
      preset?.name === "Polaroid";

    tempPresetRef.current = preset || null;

    // Always explicitly set overlay — never rely on previous state
    setOverlayEnabled(overlayEnabledParam ?? false);
    setStrokeEnabled(strokeEnabledParam ?? true);
    setTextPosition(textPositionParam ?? { x: 0, y: 0 });
    setIsSharing(true);
    setImageLoaded(false);
    if (preset) setTempPreset(preset);

    const loadPromise = waitForImageLoad(!!imageToUse);
    setTempBackgroundImage(imageToUse);

    await loadPromise;
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to save images to your camera roll",
        );
        return;
      }

      const refToCapture = isPolaroid ? polaroidCardRef : verseCardRef;
      if (!refToCapture.current) {
        console.error("❌ Capture ref is null");
        return;
      }

      console.log(
        "💾 Capturing",
        isPolaroid ? "POLAROID" : "REGULAR",
        "image for save:",
        imageToUse || "black",
      );
      const uri = await captureRef(refToCapture, {
        format: "png",
        quality: 1,
      });

      console.log("✅ Captured image:", uri);

      // Save to camera roll
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success", "Image saved to camera roll!");
    } catch (error) {
      console.error("❌ Error saving:", error);
      Alert.alert("Error", "Failed to save image");
    } finally {
      tempPresetRef.current = null;
      setTempBackgroundImage("");
      setTempPreset(null);
      setSelectedVerse(null);
      setImageLoaded(false);
      setIsSharing(false);
    }
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {bookName} {chapter}
            </Text>
            <Text style={styles.headerSubtitle}>{bibleVersion}</Text>
          </View>
          <View style={styles.headerRightButtons}></View>
        </View>

        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [
                {
                  translateX: swipePosition.interpolate({
                    inputRange: [-100, 0, 100],
                    outputRange: [-20, 0, 20],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <ScrollView ref={scrollViewRef} style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Loading chapter...</Text>
              </View>
            ) : verses.length > 0 ? (
              <View style={styles.versesContainer}>
                {verses
                  .filter(
                    (verse) =>
                      verse &&
                      typeof verse.number === "number" &&
                      !isNaN(verse.number),
                  )
                  .map((verse) => {
                    const isHighlighted = highlightedVerses.has(verse.number);
                    const isCurrentlyReading =
                      currentlyReadingVerse === verse.number;
                    return (
                      <Pressable
                        key={`verse-${bookName}-${chapter}-${verse.number}`}
                        style={({ pressed }) => [
                          styles.verseBlock,
                          isHighlighted && styles.verseBlockHighlighted,
                          isCurrentlyReading && styles.verseBlockReading,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => handleVerseTap(verse)}
                        onLongPress={() => handleVerseLongPress(verse)}
                        onLayout={(e) => {
                          verseLayoutsRef.current[verse.number] =
                            e.nativeEvent.layout.y;
                        }}
                      >
                        <Text
                          style={[
                            styles.verseNumber,
                            isHighlighted && styles.verseNumberHighlighted,
                            isCurrentlyReading && styles.verseNumberReading,
                          ]}
                        >
                          {verse.number}
                        </Text>
                        <View
                          style={{
                            flex: 1,
                            flexShrink: 1,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Text
                            style={[
                              styles.verseText,
                              isHighlighted && styles.verseTextHighlighted,
                              isCurrentlyReading && styles.verseTextReading,
                            ]}
                          >
                            {cleanVerseText(verse.text)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
              </View>
            ) : (
              <View style={styles.verseContainer}>
                <Text style={styles.placeholderText}>
                  Unable to load chapter
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Please check your connection and try again
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Hidden verse cards for sharing - BOTH always rendered to avoid state timing issues */}
        {selectedVerse && (
          <View style={styles.hiddenCard}>
            {/* Polaroid version - always rendered */}
            <View
              ref={polaroidCardRef}
              style={styles.shareCard}
              collapsable={false}
            >
              <View style={styles.polaroidShareCard}>
                {tempBackgroundImage ? (
                  <Image
                    source={{ uri: tempBackgroundImage }}
                    style={styles.polaroidSharePhoto}
                    resizeMode="cover"
                    onLoad={() => {
                      setImageLoaded(true);
                      imageLoadResolveRef.current?.();
                    }}
                  />
                ) : (
                  <View
                    style={[
                      styles.polaroidSharePhoto,
                      { backgroundColor: "#000" },
                    ]}
                  />
                )}
                <View style={styles.polaroidShareBottom}>
                  <Text style={styles.polaroidShareDate}>
                    {new Date().toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.polaroidShareText,
                      tempPresetRef.current?.font_family && {
                        fontFamily: tempPresetRef.current.font_family,
                      },
                      tempPresetRef.current?.text_color && {
                        color: tempPresetRef.current.text_color,
                      },
                    ]}
                  >
                    {cleanVerseText(selectedVerse.text)}
                  </Text>
                  <Text style={styles.polaroidShareRef}>
                    {`${bookName} ${chapter}:${selectedVerse.number}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Regular version - always rendered */}
            <View
              ref={verseCardRef}
              style={styles.shareCard}
              collapsable={false}
            >
              {tempBackgroundImage ? (
                <>
                  <Image
                    source={{ uri: tempBackgroundImage }}
                    style={styles.shareCardBackground}
                    resizeMode="cover"
                    onLoad={() => {
                      console.log("✅ Background image loaded");
                      setImageLoaded(true);
                      imageLoadResolveRef.current?.();
                    }}
                    onError={(error) => {
                      console.error(
                        "❌ Background image failed to load:",
                        error,
                      );
                      setImageLoaded(false);
                    }}
                  />
                  {overlayEnabled && (
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      style={styles.shareCardOverlay}
                    />
                  )}
                  <View
                    style={[
                      styles.shareCardContent,
                      {
                        transform: [
                          { translateX: textPosition.x },
                          { translateY: textPosition.y },
                        ],
                      },
                    ]}
                  >
                    {renderStrokedText(
                      `"${cleanVerseText(selectedVerse.text)}"`,
                      styles.shareVerseText,
                    )}
                    {renderStrokedText(
                      `${bookName} ${chapter}:${selectedVerse.number}`,
                      styles.shareReference,
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.shareCardBlack}>
                  <View
                    style={[
                      styles.shareCardContent,
                      {
                        transform: [
                          { translateX: textPosition.x },
                          { translateY: textPosition.y },
                        ],
                      },
                    ]}
                  >
                    {renderStrokedText(
                      `"${cleanVerseText(selectedVerse.text)}"`,
                      styles.shareVerseText,
                    )}
                    {renderStrokedText(
                      `${bookName} ${chapter}:${selectedVerse.number}`,
                      styles.shareReference,
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <ShareModal
          visible={shareModalVisible}
          onClose={() => {
            setShareModalVisible(false);
            setSelectedVerse(null);
          }}
          onShare={handleShare}
          onSave={handleSave}
          onAskChat={handleAskChat}
          currentImage={tempBackgroundImage}
          verse={
            selectedVerse
              ? {
                  text: cleanVerseText(selectedVerse.text),
                  reference: `${bookName} ${chapter}:${selectedVerse.number}`,
                }
              : undefined
          }
          version={bibleVersion}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    flex: 1,
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
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  bookmarkButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9ca3af",
  },
  verseContainer: {
    padding: 24,
    alignItems: "center",
    paddingTop: 100,
  },
  placeholderText: {
    fontSize: 24,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  versesContainer: {
    padding: 20,
  },
  verseBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
    padding: 12,
    borderRadius: 4,
    position: "relative",
  },
  verseBlockHighlighted: {
    backgroundColor: "rgba(255, 235, 59, 0.25)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255, 235, 59, 0.6)",
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6b7280",
    minWidth: 30,
    flexShrink: 0,
  },
  verseNumberHighlighted: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#ffffff",
  },
  verseTextHighlighted: {
    color: "#ffffff",
    fontWeight: "500",
  },
  verseBlockReading: {
    backgroundColor: "#1e40af",
    borderLeftColor: "#3b82f6",
    transform: [{ scale: 1.02 }],
  },
  verseNumberReading: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  verseTextReading: {
    color: "#ffffff",
    fontWeight: "600",
  },
  readingIndicator: {
    marginLeft: 8,
    opacity: 0.8,
  },
  audioButton: {
    padding: 8,
  },
  stopButton: {
    padding: 8,
    marginLeft: 8,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  hiddenCard: {
    position: "absolute",
    left: -9999,
    top: -9999,
  },
  shareCard: {
    width: Dimensions.get("window").width - 32,
    height: ((Dimensions.get("window").width - 32) * 16) / 9, // 9:16 aspect ratio for vertical format
    borderRadius: 16,
    overflow: "hidden",
  },
  shareCardBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  shareCardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shareCardBlack: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  shareCardContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  shareVerseText: {
    fontSize: 22,
    fontWeight: "300",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  shareReference: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  // Polaroid share styles
  polaroidShareCard: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  polaroidSharePhoto: {
    width: "100%",
    height: "72%",
    backgroundColor: "#000",
    marginBottom: 2,
  },
  polaroidShareBottom: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#f8f8f8",
    minHeight: 130,
  },
  polaroidShareDate: {
    fontFamily: "Caveat",
    fontSize: 16,
    color: "#888",
    marginBottom: 6,
  },
  polaroidShareText: {
    fontFamily: "Caveat",
    fontSize: 19,
    color: "#2c3e50",
    lineHeight: 26,
    marginBottom: 6,
  },
  polaroidShareRef: {
    fontFamily: "Caveat",
    fontSize: 20,
    color: "#555",
    fontWeight: "700",
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    minWidth: 50,
    alignItems: "center",
  },
  speedText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  speedModalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#2a2a2a",
    maxHeight: "80%",
  },
  speedModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  speedModalSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
    textAlign: "center",
  },
  speedOptions: {
    gap: 10,
    marginBottom: 16,
  },
  speedOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#2a2a2a",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2a2a2a",
  },
  speedOptionSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#60a5fa",
  },
  speedOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  speedOptionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9ca3af",
  },
  speedOptionTextSelected: {
    color: "#ffffff",
  },
  speedOptionLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  speedCloseButton: {
    marginTop: 8,
    padding: 18,
    backgroundColor: "#2a2a2a",
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  speedCloseButtonText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
});
