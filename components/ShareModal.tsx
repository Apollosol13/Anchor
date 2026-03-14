import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { imageApi } from "../lib/api";
import { AnchorLogo } from "./AnchorLogo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (
    imageUrl: string | null,
    strokeEnabled?: boolean,
    textPosition?: { x: number; y: number },
    overlayEnabled?: boolean,
    preset?: any,
  ) => Promise<void>;
  onSave?: (
    imageUrl: string | null,
    strokeEnabled?: boolean,
    textPosition?: { x: number; y: number },
    overlayEnabled?: boolean,
    preset?: any,
  ) => Promise<void>;
  onAskChat?: () => void;
  currentImage?: string;
  verse?: {
    text: string;
    reference: string;
  };
  version?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  onShare,
  onSave,
  onAskChat,
  currentImage,
  verse,
  version,
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [presets, setPresets] = useState<any[]>([]);
  const [brokenPresetIds, setBrokenPresetIds] = useState<Set<any>>(new Set());
  const [loading, setLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [polaroidFrameUrl, setPolaroidFrameUrl] = useState<string | null>(null);
  const [isSearchTemplate, setIsSearchTemplate] = useState(false);
  const [isIpodTemplate, setIsIpodTemplate] = useState(false);
  const [isNokiaTemplate, setIsNokiaTemplate] = useState(false);
  const [isWin95Template, setIsWin95Template] = useState(false);
  const [win95PhotoUrl, setWin95PhotoUrl] = useState<string | null>(null);
  const [isHtmlTemplate, setIsHtmlTemplate] = useState(false);
  const [isMailTemplate, setIsMailTemplate] = useState(false);
  const [isAppleNotesTemplate, setIsAppleNotesTemplate] = useState(false);
  const [appleNotesPhotoUrl, setAppleNotesPhotoUrl] = useState<string | null>(
    null,
  );
  const [isCalcTemplate, setIsCalcTemplate] = useState(false);
  const [isIMessageTemplate, setIsIMessageTemplate] = useState(false);
  const [isAppleMusicTemplate, setIsAppleMusicTemplate] = useState(false);
  const [appleMusicAlbumUrl, setAppleMusicAlbumUrl] = useState<string | null>(
    null,
  );
  const [isVhsTemplate, setIsVhsTemplate] = useState(false);
  const [isRetroGameTemplate, setIsRetroGameTemplate] = useState(false);

  const [isReceiptTemplate, setIsReceiptTemplate] = useState(false);
  const [isMacOsTemplate, setIsMacOsTemplate] = useState(false);
  const [isAirdropTemplate, setIsAirdropTemplate] = useState(false);
  const [airdropPhotoUrl, setAirdropPhotoUrl] = useState<string | null>(null);
  const [isTicketStubTemplate, setIsTicketStubTemplate] = useState(false);
  const [ticketStubPhotoUrl, setTicketStubPhotoUrl] = useState<string | null>(
    null,
  );
  const [isTweetTemplate, setIsTweetTemplate] = useState(false);
  const [isNotificationTemplate, setIsNotificationTemplate] = useState(false);
  const [isScreenTimeTemplate, setIsScreenTimeTemplate] = useState(false);
  const [isProgressBarTemplate, setIsProgressBarTemplate] = useState(false);
  const [isHighwayTemplate, setIsHighwayTemplate] = useState(false);
  const [isStickyNoteTemplate, setIsStickyNoteTemplate] = useState(false);
  const [isComicTemplate, setIsComicTemplate] = useState(false);
  const [isPostcardTemplate, setIsPostcardTemplate] = useState(false);
  const [postcardFlipped, setPostcardFlipped] = useState(false);
  const [isXpOpenTemplate, setIsXpOpenTemplate] = useState(false);
  const [xpPhotoUrl, setXpPhotoUrl] = useState<string | null>(null);
  const [isMonopolyTemplate, setIsMonopolyTemplate] = useState(false);
  const [isAppStoreTemplate, setIsAppStoreTemplate] = useState(false);
  const [isRevivalTemplate, setIsRevivalTemplate] = useState(false);
  const [isWarningTemplate, setIsWarningTemplate] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const polaroidCaptureRef = useRef<View>(null);
  const searchCaptureRef = useRef<View>(null);
  const ipodCaptureRef = useRef<View>(null);
  const nokiaCaptureRef = useRef<View>(null);
  const win95CaptureRef = useRef<View>(null);
  const htmlCaptureRef = useRef<View>(null);
  const mailCaptureRef = useRef<View>(null);
  const appleNotesCaptureRef = useRef<View>(null);
  const calcCaptureRef = useRef<View>(null);
  const imessageCaptureRef = useRef<View>(null);
  const appleMusicCaptureRef = useRef<View>(null);
  const vhsCaptureRef = useRef<View>(null);
  const retroGameCaptureRef = useRef<View>(null);

  const receiptCaptureRef = useRef<View>(null);
  const macOsCaptureRef = useRef<View>(null);
  const airdropCaptureRef = useRef<View>(null);
  const ticketStubCaptureRef = useRef<View>(null);
  const tweetCaptureRef = useRef<View>(null);
  const notificationCaptureRef = useRef<View>(null);
  const screenTimeCaptureRef = useRef<View>(null);
  const progressBarCaptureRef = useRef<View>(null);
  const highwayCaptureRef = useRef<View>(null);
  const stickyNoteCaptureRef = useRef<View>(null);
  const comicCaptureRef = useRef<View>(null);
  const postcardCaptureRef = useRef<View>(null);
  const xpOpenCaptureRef = useRef<View>(null);
  const monopolyCaptureRef = useRef<View>(null);
  const appStoreCaptureRef = useRef<View>(null);
  const revivalCaptureRef = useRef<View>(null);
  const warningCaptureRef = useRef<View>(null);
  const cameraRollCaptureRef = useRef<View>(null);
  const [loadError, setLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Text customization states
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [selectedFont, setSelectedFont] = useState<string | undefined>(
    undefined,
  );
  const [textScale, setTextScale] = useState(1);
  const textScaleRef = useRef(1);
  const pan = useRef(new Animated.ValueXY()).current;
  const textPositionRef = useRef({ x: 0, y: 0 });

  const FONT_OPTIONS = [
    { label: "Default", value: undefined },
    { label: "Literature", value: "Cochin" },
    { label: "Georgia", value: "Georgia" },
    { label: "Caveat", value: "Caveat" },
    { label: "Baskerville", value: "Baskerville" },
    { label: "Palatino", value: "Palatino" },
    { label: "Courier", value: "Courier New" },
    { label: "Gill Sans", value: "Gill Sans" },
  ];

  // Keep refs in sync so panResponder callbacks (closures) see latest values
  useEffect(() => {
    textPositionRef.current = textPosition;
  }, [textPosition]);

  // Helper function to clean verse text by removing ALL bracketed numbers
  const cleanVerseText = (text: string) => {
    return text
      .replace(/\[\d+\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  // Pan responder for dragging text
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: textPositionRef.current.x,
          y: textPositionRef.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        const pos = {
          x: textPositionRef.current.x + gesture.dx,
          y: textPositionRef.current.y + gesture.dy,
        };
        setTextPosition(pos);
        textPositionRef.current = pos;
      },
    }),
  ).current;

  const adjustTextSize = (direction: "up" | "down") => {
    setTextScale((prev) => {
      const next =
        direction === "up"
          ? Math.min(3, parseFloat((prev + 0.15).toFixed(2)))
          : Math.max(0.4, parseFloat((prev - 0.15).toFixed(2)));
      textScaleRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    if (showPresets) {
      fetchPresets();
    }
  }, [showPresets]);

  // Reset customization state every time the modal opens
  useEffect(() => {
    if (visible) {
      setOverlayEnabled(false);
      setStrokeEnabled(true);
      setTextScale(1);
      textScaleRef.current = 1;
      setSelectedFont(undefined);
      setTextPosition({ x: 0, y: 0 });
      textPositionRef.current = { x: 0, y: 0 };
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible]);

  const fetchPresets = async (retryCount = 0) => {
    setLoading(true);
    setLoadError(false);
    try {
      console.log(`📸 Fetching presets (attempt ${retryCount + 1})...`);
      const response = await imageApi.getPresets();
      console.log("✅ Fetched presets:", response?.length || 0, "images");

      if (response && response.length > 0) {
        setPresets(response);
        setLoadError(false);
      } else {
        console.warn("⚠️ No presets returned from API");
        setPresets([]);
        setLoadError(true);
      }
    } catch (error) {
      console.error("❌ Error fetching presets:", error);

      // Retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
        console.log(`🔄 Retrying in ${delay}ms...`);
        setTimeout(() => fetchPresets(retryCount + 1), delay);
      } else {
        setPresets([]);
        setLoadError(true);
        Alert.alert(
          "Connection Error",
          "Failed to load presets. Please check your connection and try again.",
          [{ text: "OK" }],
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateActionBar = () => (
    <View style={styles.actionBar}>
      <TouchableOpacity
        style={[styles.actionIcon, isSharing && styles.actionIconDisabled]}
        onPress={handleConfirmSave}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons name="download-outline" size={26} color="#ffffff" />
            <Text style={styles.actionIconLabel}>Save</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionIcon, isSharing && styles.actionIconDisabled]}
        onPress={handleConfirmShare}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons name="share-outline" size={26} color="#ffffff" />
            <Text style={styles.actionIconLabel}>Share</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const handleShareAsIs = async () => {
    setIsSharing(true);
    await onShare(null, strokeEnabled, textPosition, overlayEnabled); // null means use current background
    setIsSharing(false);
    onClose();
  };

  const handlePickFromCameraRoll = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUrl(result.assets[0].uri);
        setShowPresets(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handlePickPreset = () => {
    setShowPresets(true);
  };

  const handleSelectPreset = (preset: any) => {
    // Check if this is a frame template (like Polaroid)
    const isFrameTemplate =
      preset.is_frame_template || preset.name === "Polaroid";
    // Check if this is the Anchor Search template
    const isSearch =
      preset.name === "Anchor Search" || preset.is_search_template;

    const isIpod = preset.name === "iPod" || preset.is_ipod_template;
    const isNokia = preset.name === "Nokia" || preset.is_nokia_template;
    const isWin95 = preset.name === "Windows 95" || preset.is_win95_template;
    const isHtml = preset.name === "HTML" || preset.is_html_template;
    const isMail = preset.name === "Mail" || preset.is_mail_template;
    const isAppleNotes =
      preset.name === "Apple Notes" || preset.is_apple_notes_template;
    const isCalc = preset.name === "Calculator" || preset.is_calc_template;
    const isIMessage =
      preset.name === "iMessage" || preset.is_imessage_template;
    const isAppleMusic =
      preset.name === "Apple Music" || preset.is_apple_music_template;
    const isVhs = preset.name === "VHS" || preset.is_vhs_template;
    const isRetroGame =
      preset.name === "Retro Game" || preset.is_retro_game_template;
    const isReceipt = preset.name === "Receipt" || preset.is_receipt_template;
    const isAirdrop = preset.name === "AirDrop" || preset.is_airdrop_template;
    const isMacOs = preset.name === "Mac OS" || preset.is_macos_template;
    const isTicketStub =
      preset.name === "Ticket Stub" || preset.is_ticket_stub_template;
    const isTweet = preset.name === "Tweet" || preset.is_tweet_template;
    const isNotification =
      preset.name === "Notification" || preset.is_notification_template;
    const isScreenTime =
      preset.name === "Screen Time" || preset.is_screen_time_template;
    const isProgressBar =
      preset.name === "Progress Bar" || preset.is_progress_bar_template;
    const isHighway =
      preset.name === "Highway Sign" || preset.is_highway_template;
    const isStickyNote =
      preset.name === "Sticky Note" || preset.is_sticky_note_template;
    const isComic = preset.name === "Comic" || preset.is_comic_template;
    const isPostcard =
      preset.name === "Postcard" || preset.is_postcard_template;
    const isXpOpen = preset.name === "XP Open" || preset.is_xp_open_template;
    const isMonopoly =
      preset.name === "Monopoly" || preset.is_monopoly_template;
    const isAppStore =
      preset.name === "App Store" || preset.is_app_store_template;
    const isRevival = preset.name === "Revival" || preset.is_revival_template;
    const isWarning = preset.name === "Warning" || preset.is_warning_template;
    if (isWarning) {
      setSelectedPreset(preset);
      setIsWarningTemplate(true);
      setSelectedImageUrl("warning");
      setShowPresets(false);
    } else if (isRevival) {
      setSelectedPreset(preset);
      setIsRevivalTemplate(true);
      setSelectedImageUrl("revival");
      setShowPresets(false);
    } else if (isAppStore) {
      setSelectedPreset(preset);
      setIsAppStoreTemplate(true);
      setSelectedImageUrl("appstore");
      setShowPresets(false);
    } else if (isMonopoly) {
      setSelectedPreset(preset);
      setIsMonopolyTemplate(true);
      setSelectedImageUrl("monopoly");
      setShowPresets(false);
    } else if (isXpOpen) {
      setSelectedPreset(preset);
      setIsXpOpenTemplate(true);
      handlePickPhotoForXpOpen();
    } else if (isPostcard) {
      setSelectedPreset(preset);
      setIsPostcardTemplate(true);
      setPostcardFlipped(false);
      setSelectedImageUrl("postcard");
      setShowPresets(false);
    } else if (isComic) {
      setSelectedPreset(preset);
      setIsComicTemplate(true);
      setSelectedImageUrl("comic");
      setShowPresets(false);
    } else if (isStickyNote) {
      setSelectedPreset(preset);
      setIsStickyNoteTemplate(true);
      setSelectedImageUrl("stickynote");
      setShowPresets(false);
    } else if (isHighway) {
      setSelectedPreset(preset);
      setIsHighwayTemplate(true);
      setSelectedImageUrl("highway");
      setShowPresets(false);
    } else if (isProgressBar) {
      setSelectedPreset(preset);
      setIsProgressBarTemplate(true);
      setSelectedImageUrl("progressbar");
      setShowPresets(false);
    } else if (isScreenTime) {
      setSelectedPreset(preset);
      setIsScreenTimeTemplate(true);
      setSelectedImageUrl("screentime");
      setShowPresets(false);
    } else if (isNotification) {
      setSelectedPreset(preset);
      setIsNotificationTemplate(true);
      setSelectedImageUrl("notification");
      setShowPresets(false);
    } else if (isTweet) {
      setSelectedPreset(preset);
      setIsTweetTemplate(true);
      setSelectedImageUrl("tweet");
      setShowPresets(false);
    } else if (isTicketStub) {
      setSelectedPreset(preset);
      setIsTicketStubTemplate(true);
      handlePickPhotoForTicketStub();
    } else if (isMacOs) {
      setSelectedPreset(preset);
      setIsMacOsTemplate(true);
      setSelectedImageUrl("macos");
      setShowPresets(false);
    } else if (isAirdrop) {
      setSelectedPreset(preset);
      setIsAirdropTemplate(true);
      handlePickPhotoForAirdrop();
    } else if (isReceipt) {
      setSelectedPreset(preset);
      setIsReceiptTemplate(true);
      setSelectedImageUrl("receipt");
      setShowPresets(false);
    } else if (isRetroGame) {
      setSelectedPreset(preset);
      setIsRetroGameTemplate(true);
      setSelectedImageUrl("retrogame");
      setShowPresets(false);
    } else if (isVhs) {
      setSelectedPreset(preset);
      setIsVhsTemplate(true);
      setSelectedImageUrl("vhs");
      setShowPresets(false);
    } else if (isAppleMusic) {
      setSelectedPreset(preset);
      setIsAppleMusicTemplate(true);
      handlePickAlbumForAppleMusic();
    } else if (isIMessage) {
      setSelectedPreset(preset);
      setIsIMessageTemplate(true);
      setSelectedImageUrl("imessage");
      setShowPresets(false);
    } else if (isCalc) {
      setSelectedPreset(preset);
      setIsCalcTemplate(true);
      setSelectedImageUrl("calc");
      setShowPresets(false);
    } else if (isAppleNotes) {
      setSelectedPreset(preset);
      setIsAppleNotesTemplate(true);
      setSelectedImageUrl("applenotes");
      setShowPresets(false);
    } else if (isMail) {
      setSelectedPreset(preset);
      setIsMailTemplate(true);
      setSelectedImageUrl("mail");
      setShowPresets(false);
    } else if (isHtml) {
      setSelectedPreset(preset);
      setIsHtmlTemplate(true);
      setSelectedImageUrl("html");
      setShowPresets(false);
    } else if (isWin95) {
      setSelectedPreset(preset);
      setIsWin95Template(true);
      handlePickPhotoForWin95();
    } else if (isNokia) {
      setSelectedPreset(preset);
      setIsNokiaTemplate(true);
      setSelectedImageUrl("nokia");
      setShowPresets(false);
    } else if (isSearch) {
      setSelectedPreset(preset);
      setIsSearchTemplate(true);
      setSelectedImageUrl("search");
      setShowPresets(false);
    } else if (isIpod) {
      setSelectedPreset(preset);
      setIsIpodTemplate(true);
      setSelectedImageUrl("ipod");
      setShowPresets(false);
    } else if (isFrameTemplate) {
      setPolaroidFrameUrl(preset.image_url);
      setSelectedPreset(preset);
      handlePickPhotoForFrame();
    } else {
      setSelectedImageUrl(preset.image_url);
      setSelectedPreset(preset);
      if (preset.font_family || preset.text_color) {
        setStrokeEnabled(false);
      } else {
        setStrokeEnabled(true);
      }
      setImageLoaded(false);
      setShowPresets(false);
    }
  };

  const handlePickPhotoForFrame = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        setPolaroidFrameUrl(null);
        setSelectedPreset(null);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUrl(result.assets[0].uri); // User's photo
        setStrokeEnabled(false); // Polaroid uses handwritten style
        setImageLoaded(false);
        setShowPresets(false);
      } else {
        // User canceled - reset
        setPolaroidFrameUrl(null);
        setSelectedPreset(null);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
      setPolaroidFrameUrl(null);
      setSelectedPreset(null);
    }
  };

  const handlePickPhotoForWin95 = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        setIsWin95Template(false);
        setSelectedPreset(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setWin95PhotoUrl(result.assets[0].uri);
        setSelectedImageUrl("win95");
        setShowPresets(false);
      } else {
        setIsWin95Template(false);
        setSelectedPreset(null);
      }
    } catch (error) {
      console.error("Error picking Win95 photo:", error);
      Alert.alert("Error", "Failed to select image");
      setIsWin95Template(false);
      setSelectedPreset(null);
    }
  };

  const handlePickPhotoForAppleNotes = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        setIsAppleNotesTemplate(false);
        setSelectedPreset(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setAppleNotesPhotoUrl(result.assets[0].uri);
        setSelectedImageUrl("applenotes");
        setShowPresets(false);
      } else {
        setIsAppleNotesTemplate(false);
        setSelectedPreset(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
      setIsAppleNotesTemplate(false);
      setSelectedPreset(null);
    }
  };

  const handlePickAlbumForAppleMusic = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        setIsAppleMusicTemplate(false);
        setSelectedPreset(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]) {
        setAppleMusicAlbumUrl(result.assets[0].uri);
        setSelectedImageUrl("applemusic");
        setShowPresets(false);
      } else {
        setIsAppleMusicTemplate(false);
        setSelectedPreset(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
      setIsAppleMusicTemplate(false);
      setSelectedPreset(null);
    }
  };

  const handlePickPhotoForTicketStub = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        setIsTicketStubTemplate(false);
        setSelectedPreset(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]) {
        setTicketStubPhotoUrl(result.assets[0].uri);
        setSelectedImageUrl("ticketstub");
        setShowPresets(false);
      } else {
        setIsTicketStubTemplate(false);
        setSelectedPreset(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
      setIsTicketStubTemplate(false);
      setSelectedPreset(null);
    }
  };

  const handlePickPhotoForAirdrop = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        setIsAirdropTemplate(false);
        setSelectedPreset(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]) {
        setAirdropPhotoUrl(result.assets[0].uri);
        setSelectedImageUrl("airdrop");
        setShowPresets(false);
      } else {
        setIsAirdropTemplate(false);
        setSelectedPreset(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
      setIsAirdropTemplate(false);
      setSelectedPreset(null);
    }
  };

  const handlePickPhotoForXpOpen = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
        );
        setIsXpOpenTemplate(false);
        setSelectedPreset(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]) {
        setXpPhotoUrl(result.assets[0].uri);
        setSelectedImageUrl("xpopen");
        setShowPresets(false);
      } else {
        setIsXpOpenTemplate(false);
        setSelectedPreset(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
      setIsXpOpenTemplate(false);
      setSelectedPreset(null);
    }
  };

  const handleConfirmShare = async () => {
    setIsSharing(true);

    const isPolaroid = selectedPreset?.is_frame_template || polaroidFrameUrl;
    const isSearch = isSearchTemplate;
    const isIpod = isIpodTemplate;
    const isNokia = isNokiaTemplate;
    const isWin95 = isWin95Template;
    const isHtml = isHtmlTemplate;
    const isMail = isMailTemplate;
    const isAppleNotes = isAppleNotesTemplate;
    const isCalc = isCalcTemplate;
    const isIMessage = isIMessageTemplate;
    const isAppleMusic = isAppleMusicTemplate;
    const isVhs = isVhsTemplate;
    const isRetroGame = isRetroGameTemplate;
    const isReceipt = isReceiptTemplate;
    const isAirdrop = isAirdropTemplate;
    const isMacOs = isMacOsTemplate;
    const isTicketStub = isTicketStubTemplate;
    const isTweet = isTweetTemplate;
    const isNotification = isNotificationTemplate;
    const isScreenTime = isScreenTimeTemplate;
    const isProgressBar = isProgressBarTemplate;
    const isHighway = isHighwayTemplate;
    const isStickyNote = isStickyNoteTemplate;
    const isComic = isComicTemplate;
    const isPostcard = isPostcardTemplate;
    const isXpOpen = isXpOpenTemplate;
    const isMonopoly = isMonopolyTemplate;
    const isAppStore = isAppStoreTemplate;
    const isRevival = isRevivalTemplate;
    const isWarning = isWarningTemplate;
    if (isWarning) {
      try {
        if (!warningCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(warningCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Warning:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isRevival) {
      try {
        if (!revivalCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(revivalCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Revival:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isAppStore) {
      try {
        if (!appStoreCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(appStoreCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing App Store:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isMonopoly) {
      try {
        if (!monopolyCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(monopolyCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Monopoly:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isXpOpen) {
      try {
        if (!xpOpenCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(xpOpenCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing XP Open:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isPostcard) {
      try {
        if (!postcardCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(postcardCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Postcard:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isComic) {
      try {
        if (!comicCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(comicCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Comic:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isStickyNote) {
      try {
        if (!stickyNoteCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(stickyNoteCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Sticky Note:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isHighway) {
      try {
        if (!highwayCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(highwayCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Highway Sign:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isProgressBar) {
      try {
        if (!progressBarCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(progressBarCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Progress Bar:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isScreenTime) {
      try {
        if (!screenTimeCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(screenTimeCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Screen Time:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isNotification) {
      try {
        if (!notificationCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(notificationCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Notification:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isTweet) {
      try {
        if (!tweetCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(tweetCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Tweet:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isTicketStub) {
      try {
        if (!ticketStubCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(ticketStubCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Ticket Stub:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isMacOs) {
      try {
        if (!macOsCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(macOsCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Mac OS:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isAirdrop) {
      try {
        if (!airdropCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(airdropCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing AirDrop:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isReceipt) {
      try {
        if (!receiptCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(receiptCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Receipt:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isRetroGame) {
      try {
        if (!retroGameCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(retroGameCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Retro Game:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isVhs) {
      try {
        if (!vhsCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(vhsCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing VHS:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isAppleMusic) {
      try {
        if (!appleMusicCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(appleMusicCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Apple Music:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isIMessage) {
      try {
        if (!imessageCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(imessageCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing iMessage:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isCalc) {
      try {
        if (!calcCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(calcCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Calc:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isAppleNotes) {
      try {
        if (!appleNotesCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(appleNotesCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Apple Notes:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isMail) {
      try {
        if (!mailCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(mailCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Mail:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isHtml) {
      try {
        if (!htmlCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(htmlCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing HTML template:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isWin95) {
      try {
        if (!win95CaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(win95CaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Win95 template:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isNokia) {
      try {
        if (!nokiaCaptureRef.current) {
          Alert.alert("Error", "Could not capture Nokia image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(nokiaCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing Nokia template:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isIpod) {
      try {
        if (!ipodCaptureRef.current) {
          Alert.alert("Error", "Could not capture iPod image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(ipodCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing iPod template:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isSearch) {
      try {
        if (!searchCaptureRef.current) {
          Alert.alert("Error", "Could not capture search image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(searchCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing search template:", error);
        Alert.alert("Error", "Failed to share");
      }
    } else if (isPolaroid) {
      // Capture the polaroid card directly from the visible preview
      try {
        if (!polaroidCaptureRef.current) {
          Alert.alert("Error", "Could not capture polaroid image");
          setIsSharing(false);
          return;
        }
        console.log("📸 Capturing polaroid card directly...");
        const uri = await captureRef(polaroidCaptureRef, {
          format: "png",
          quality: 1,
        });
        console.log("✅ Polaroid captured:", uri);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing polaroid:", error);
        Alert.alert("Error", "Failed to share polaroid");
      }
    } else {
      try {
        if (!cameraRollCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(cameraRollCaptureRef, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share Verse",
          });
        } else {
          Alert.alert("Sharing not available");
        }
      } catch (error) {
        console.error("❌ Error capturing camera roll preview:", error);
        Alert.alert("Error", "Failed to share");
      }
    }

    setIsSharing(false);
    onClose();
    setSelectedImageUrl(null);
    setSelectedPreset(null);
    setPolaroidFrameUrl(null);
    setIsSearchTemplate(false);
    setIsIpodTemplate(false);
    setIsNokiaTemplate(false);
    setIsWin95Template(false);
    setWin95PhotoUrl(null);
    setIsHtmlTemplate(false);
    setIsMailTemplate(false);
    setIsAppleNotesTemplate(false);
    setAppleNotesPhotoUrl(null);
    setIsCalcTemplate(false);
    setIsIMessageTemplate(false);
    setIsAppleMusicTemplate(false);
    setAppleMusicAlbumUrl(null);
    setIsVhsTemplate(false);
    setIsRetroGameTemplate(false);
    setIsReceiptTemplate(false);
    setIsAirdropTemplate(false);
    setAirdropPhotoUrl(null);
    setIsMacOsTemplate(false);
    setIsTicketStubTemplate(false);
    setTicketStubPhotoUrl(null);
    setIsTweetTemplate(false);
    setIsNotificationTemplate(false);
    setIsScreenTimeTemplate(false);
    setIsProgressBarTemplate(false);
    setIsHighwayTemplate(false);
    setIsStickyNoteTemplate(false);
    setIsComicTemplate(false);
    setIsPostcardTemplate(false);
    setPostcardFlipped(false);
    setIsXpOpenTemplate(false);
    setXpPhotoUrl(null);
    setIsMonopolyTemplate(false);
    setIsAppStoreTemplate(false);
    setIsRevivalTemplate(false);
    setIsWarningTemplate(false);
    setImageLoaded(false);
    setTextPosition({ x: 0, y: 0 });
  };

  const handleConfirmSave = async () => {
    setIsSharing(true);

    const isPolaroid = selectedPreset?.is_frame_template || polaroidFrameUrl;
    const isSearch = isSearchTemplate;
    const isIpod = isIpodTemplate;
    const isNokia = isNokiaTemplate;
    const isWin95 = isWin95Template;
    const isHtml = isHtmlTemplate;
    const isMail = isMailTemplate;
    const isAppleNotes = isAppleNotesTemplate;
    const isCalc = isCalcTemplate;
    const isIMessage = isIMessageTemplate;
    const isAppleMusic = isAppleMusicTemplate;
    const isVhs = isVhsTemplate;
    const isRetroGame = isRetroGameTemplate;
    const isReceipt = isReceiptTemplate;
    const isAirdrop = isAirdropTemplate;
    const isMacOs = isMacOsTemplate;
    const isTicketStub = isTicketStubTemplate;
    const isTweet = isTweetTemplate;
    const isNotification = isNotificationTemplate;
    const isScreenTime = isScreenTimeTemplate;
    const isProgressBar = isProgressBarTemplate;
    const isHighway = isHighwayTemplate;
    const isStickyNote = isStickyNoteTemplate;
    const isComic = isComicTemplate;
    const isPostcard = isPostcardTemplate;
    const isXpOpen = isXpOpenTemplate;
    const isMonopoly = isMonopolyTemplate;
    const isAppStore = isAppStoreTemplate;
    const isRevival = isRevivalTemplate;
    const isWarning = isWarningTemplate;
    if (isWarning) {
      try {
        if (!warningCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(warningCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Warning sign saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Warning:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isRevival) {
      try {
        if (!revivalCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(revivalCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Revival card saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Revival:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isAppStore) {
      try {
        if (!appStoreCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(appStoreCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "App Store listing saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving App Store:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isMonopoly) {
      try {
        if (!monopolyCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(monopolyCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Monopoly card saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Monopoly:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isXpOpen) {
      try {
        if (!xpOpenCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(xpOpenCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "XP Open saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving XP Open:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isPostcard) {
      try {
        if (!postcardCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(postcardCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Postcard saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Postcard:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isComic) {
      try {
        if (!comicCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(comicCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Comic saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Comic:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isStickyNote) {
      try {
        if (!stickyNoteCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(stickyNoteCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Sticky Note saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Sticky Note:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isHighway) {
      try {
        if (!highwayCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(highwayCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Highway Sign saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Highway Sign:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isProgressBar) {
      try {
        if (!progressBarCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(progressBarCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Progress Bar saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Progress Bar:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isScreenTime) {
      try {
        if (!screenTimeCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(screenTimeCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Screen Time saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Screen Time:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isNotification) {
      try {
        if (!notificationCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(notificationCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Notification saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Notification:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isTweet) {
      try {
        if (!tweetCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(tweetCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Tweet saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Tweet:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isTicketStub) {
      try {
        if (!ticketStubCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(ticketStubCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Ticket Stub saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Ticket Stub:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isMacOs) {
      try {
        if (!macOsCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(macOsCaptureRef, {
          format: "png",
          quality: 1,
        });
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Mac OS card saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Mac OS:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isAirdrop) {
      try {
        if (!airdropCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(airdropCaptureRef, {
          format: "png",
          quality: 1,
        });
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "AirDrop card saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving AirDrop:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isReceipt) {
      try {
        if (!receiptCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(receiptCaptureRef, {
          format: "png",
          quality: 1,
        });
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Receipt saved to your camera roll.");
      } catch (error) {
        console.error("❌ Error saving Receipt:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isRetroGame) {
      try {
        if (!retroGameCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(retroGameCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving Retro Game:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isVhs) {
      try {
        if (!vhsCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(vhsCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving VHS:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isAppleMusic) {
      try {
        if (!appleMusicCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(appleMusicCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving Apple Music:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isIMessage) {
      try {
        if (!imessageCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(imessageCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving iMessage:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isCalc) {
      try {
        if (!calcCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(calcCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving Calc:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isAppleNotes) {
      try {
        if (!appleNotesCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(appleNotesCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving Apple Notes:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isMail) {
      try {
        if (!mailCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(mailCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving Mail:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isHtml) {
      try {
        if (!htmlCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(htmlCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving HTML template:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isWin95) {
      try {
        if (!win95CaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(win95CaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving Win95 template:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isNokia) {
      try {
        if (!nokiaCaptureRef.current) {
          Alert.alert("Error", "Could not capture Nokia image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(nokiaCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving Nokia template:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isIpod) {
      try {
        if (!ipodCaptureRef.current) {
          Alert.alert("Error", "Could not capture iPod image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(ipodCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving iPod template:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isSearch) {
      try {
        if (!searchCaptureRef.current) {
          Alert.alert("Error", "Could not capture search image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(searchCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving search template:", error);
        Alert.alert("Error", "Failed to save");
      }
    } else if (isPolaroid) {
      // Capture the polaroid card directly from the visible preview
      try {
        if (!polaroidCaptureRef.current) {
          Alert.alert("Error", "Could not capture polaroid image");
          setIsSharing(false);
          return;
        }
        console.log("💾 Capturing polaroid card for save...");
        const uri = await captureRef(polaroidCaptureRef, {
          format: "png",
          quality: 1,
        });
        console.log("✅ Polaroid captured:", uri);

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Success", "Image saved to camera roll!");
      } catch (error) {
        console.error("❌ Error saving polaroid:", error);
        Alert.alert("Error", "Failed to save polaroid");
      }
    } else {
      try {
        if (!cameraRollCaptureRef.current) {
          Alert.alert("Error", "Could not capture image");
          setIsSharing(false);
          return;
        }
        const uri = await captureRef(cameraRollCaptureRef, {
          format: "png",
          quality: 1,
        });
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow access to save images to your camera roll",
          );
          setIsSharing(false);
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved!", "Image saved to camera roll.");
      } catch (error) {
        console.error("❌ Error saving camera roll preview:", error);
        Alert.alert("Error", "Failed to save");
      }
    }

    setIsSharing(false);
    onClose();
    setSelectedImageUrl(null);
    setSelectedPreset(null);
    setPolaroidFrameUrl(null);
    setIsSearchTemplate(false);
    setImageLoaded(false);
    setTextPosition({ x: 0, y: 0 });
  };

  const handleCancelPreview = () => {
    setSelectedImageUrl(null);
    setSelectedPreset(null);
    setPolaroidFrameUrl(null);
    setIsSearchTemplate(false);
    setIsIpodTemplate(false);
    setIsNokiaTemplate(false);
    setIsWin95Template(false);
    setWin95PhotoUrl(null);
    setIsHtmlTemplate(false);
    setIsMailTemplate(false);
    setIsAppleNotesTemplate(false);
    setAppleNotesPhotoUrl(null);
    setIsCalcTemplate(false);
    setIsIMessageTemplate(false);
    setIsAppleMusicTemplate(false);
    setAppleMusicAlbumUrl(null);
    setIsVhsTemplate(false);
    setIsRetroGameTemplate(false);
    setIsReceiptTemplate(false);
    setIsAirdropTemplate(false);
    setAirdropPhotoUrl(null);
    setIsMacOsTemplate(false);
    setIsTicketStubTemplate(false);
    setTicketStubPhotoUrl(null);
    setIsTweetTemplate(false);
    setIsNotificationTemplate(false);
    setIsScreenTimeTemplate(false);
    setIsProgressBarTemplate(false);
    setIsHighwayTemplate(false);
    setIsStickyNoteTemplate(false);
    setIsComicTemplate(false);
    setIsPostcardTemplate(false);
    setPostcardFlipped(false);
    setIsXpOpenTemplate(false);
    setXpPhotoUrl(null);
    setIsMonopolyTemplate(false);
    setIsAppStoreTemplate(false);
    setIsRevivalTemplate(false);
    setIsWarningTemplate(false);
    setImageLoaded(false);
    setTextPosition({ x: 0, y: 0 });
    textPositionRef.current = { x: 0, y: 0 };
    pan.setValue({ x: 0, y: 0 });
    // Reset text customization so it doesn't bleed into the next template
    setOverlayEnabled(false);
    setStrokeEnabled(true);
    setTextScale(1);
    textScaleRef.current = 1;
    setSelectedFont(undefined);
    setShowPresets(true);
  };

  const renderMainOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={styles.modalTitle}>Share Verse</Text>
      <Text style={styles.modalSubtitle}>
        Choose how you'd like to share this verse
      </Text>

      <TouchableOpacity style={styles.optionButton} onPress={handleShareAsIs}>
        <View style={styles.optionIcon}>
          <Ionicons name="image-outline" size={28} color="#ffffff" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Share As Is</Text>
          <Text style={styles.optionDescription}>
            Use the current background
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#6b7280" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={handlePickFromCameraRoll}
      >
        <View style={styles.optionIcon}>
          <Ionicons name="images-outline" size={28} color="#ffffff" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Camera Roll</Text>
          <Text style={styles.optionDescription}>Choose from your photos</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#6b7280" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={handlePickPreset}>
        <View style={styles.optionIcon}>
          <Ionicons name="color-palette-outline" size={28} color="#ffffff" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Preset Backgrounds</Text>
          <Text style={styles.optionDescription}>
            Choose from our collection
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#6b7280" />
      </TouchableOpacity>

      {onAskChat && (
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            onClose();
            onAskChat();
          }}
        >
          <View style={styles.optionIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={28}
              color="#ffffff"
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Ask Chat</Text>
            <Text style={styles.optionDescription}>
              Get AI explanation and insights
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6b7280" />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPresets = () => (
    <View style={styles.presetsView}>
      <View style={styles.presetsHeader}>
        <TouchableOpacity
          onPress={() => setShowPresets(false)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.presetsTitle}>Choose Background</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading presets...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.presetsScroll}
          contentContainerStyle={styles.presetsContainer}
        >
          {/* HTML preset */}
          <TouchableOpacity
            key="html-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "HTML", is_html_template: true })
            }
          >
            <View style={styles.htmlPresetThumbnail}>
              <View style={styles.htmlThumbGlowBtn}>
                <Text style={styles.htmlThumbBtnText}>verse</Text>
              </View>
              <View style={styles.htmlThumbCodeBlock}>
                <View style={styles.htmlThumbDots}>
                  <View
                    style={[
                      styles.htmlThumbDot,
                      { backgroundColor: "#ff5f57" },
                    ]}
                  />
                  <View
                    style={[
                      styles.htmlThumbDot,
                      { backgroundColor: "#febc2e" },
                    ]}
                  />
                  <View
                    style={[
                      styles.htmlThumbDot,
                      { backgroundColor: "#28c840" },
                    ]}
                  />
                </View>
                <Text style={styles.htmlThumbCode}>
                  {"<button>ref</button>"}
                </Text>
              </View>
            </View>
            <View style={styles.htmlPresetLabel}>
              <Text style={styles.htmlPresetLabelText}>HTML</Text>
            </View>
          </TouchableOpacity>

          {/* Windows 95 preset */}
          <TouchableOpacity
            key="win95-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Windows 95",
                is_win95_template: true,
              })
            }
          >
            <View style={styles.win95PresetThumbnail}>
              {/* Mini desktop bg */}
              <View style={styles.win95ThumbDesktop}>
                {/* Mini dialog */}
                <View style={styles.win95ThumbDialog}>
                  <View style={styles.win95ThumbTitleBar}>
                    <Text style={styles.win95ThumbTitleText}>Anchor</Text>
                    <Text style={styles.win95ThumbX}>✕</Text>
                  </View>
                  <View style={styles.win95ThumbBody}>
                    <View style={styles.win95ThumbLine} />
                    <View style={[styles.win95ThumbLine, { width: "70%" }]} />
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.win95PresetLabel}>
              <Text style={styles.win95PresetLabelText}>Win 95</Text>
            </View>
          </TouchableOpacity>

          {/* Mac OS preset */}
          <TouchableOpacity
            key="macos-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Mac OS", is_macos_template: true })
            }
          >
            <View style={styles.macosThumb}>
              {/* Menu bar */}
              <View style={styles.macosThumbMenuBar}>
                <Text style={styles.macosThumbDiamond}>◇</Text>
                <View style={styles.macosThumbMenuActive}>
                  <Text style={styles.macosThumbMenuActiveText}>File</Text>
                </View>
                <Text style={styles.macosThumbMenuItem}>Edit</Text>
              </View>
              {/* Dropdown */}
              <View style={styles.macosThumbDropdown}>
                <Text style={styles.macosThumbDropItem}>Ps 23:4</Text>
                <View style={styles.macosThumbDropDivider} />
                <Text style={styles.macosThumbDropVerse} numberOfLines={2}>
                  Verse...
                </Text>
              </View>
            </View>
            <View style={styles.receiptThumbLabel}>
              <Text style={styles.receiptThumbLabelText}>MAC OS</Text>
            </View>
          </TouchableOpacity>

          {/* Receipt preset */}
          <TouchableOpacity
            key="receipt-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Receipt", is_receipt_template: true })
            }
          >
            <View style={styles.receiptThumb}>
              <Text style={styles.receiptThumbTitle}>{"ANCHOR\nRECEIPT"}</Text>
              <View style={styles.receiptThumbDivider} />
              <Text style={styles.receiptThumbRow}>PSALM 23:4</Text>
              <Text style={styles.receiptThumbRow}>Verse text...</Text>
              <View style={styles.receiptThumbDivider} />
              <Text style={styles.receiptThumbBarcode}>|||||||||||</Text>
            </View>
            <View style={styles.receiptThumbLabel}>
              <Text style={styles.receiptThumbLabelText}>RECEIPT</Text>
            </View>
          </TouchableOpacity>

          {/* AirDrop preset */}
          <TouchableOpacity
            key="airdrop-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "AirDrop", is_airdrop_template: true })
            }
          >
            <View style={styles.airdropThumb}>
              <View style={styles.airdropThumbHeader}>
                <Text style={styles.airdropThumbTitle}>Psalm 23:4</Text>
              </View>
              <View style={styles.airdropThumbPhoto}>
                <Ionicons name="image-outline" size={18} color="#999" />
              </View>
              <View style={styles.airdropThumbFooter}>
                <Text style={styles.airdropThumbDecline}>Decline</Text>
                <View style={styles.airdropThumbDivider} />
                <Text style={styles.airdropThumbAccept}>Accept</Text>
              </View>
            </View>
            <View style={styles.airdropThumbLabel}>
              <Text style={styles.airdropThumbLabelText}>AIRDROP</Text>
            </View>
          </TouchableOpacity>

          {/* Retro Game preset */}
          <TouchableOpacity
            key="retrogame-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Retro Game",
                is_retro_game_template: true,
              })
            }
          >
            <View style={styles.retroThumb}>
              <View style={styles.retroThumbSun} />
              <Text style={styles.retroThumbTitle}>PSALM 19:7</Text>
              <View style={styles.retroThumbMenu}>
                <Text style={styles.retroThumbMenuItem}>▶ Verse text...</Text>
                <Text
                  style={[
                    styles.retroThumbMenuItem,
                    { color: "rgba(255,255,255,0.5)" },
                  ]}
                >
                  continues here
                </Text>
              </View>
            </View>
            <View style={styles.retroThumbLabel}>
              <Text style={styles.retroThumbLabelText}>RETRO</Text>
            </View>
          </TouchableOpacity>

          {/* VHS preset */}
          <TouchableOpacity
            key="vhs-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "VHS", is_vhs_template: true })
            }
          >
            <View style={styles.vhsThumb}>
              {/* Top: SONY-style logo */}
              <Text style={styles.vhsThumbLogo}>ANCHOR</Text>
              {/* Title lines */}
              <Text style={styles.vhsThumbItalic}>Genesis</Text>
              <Text style={styles.vhsThumbBig}>1:1</Text>
              {/* Color stripes */}
              <View style={styles.vhsThumbStripes}>
                {[
                  "#f5c518",
                  "#f09020",
                  "#e05818",
                  "#c83020",
                  "#a02828",
                  "#701828",
                ].map((c, i) => (
                  <View
                    key={i}
                    style={[styles.vhsThumbStripe, { backgroundColor: c }]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.vhsThumbLabel}>
              <Text style={styles.vhsThumbLabelText}>VHS</Text>
            </View>
          </TouchableOpacity>

          {/* Apple Music preset */}
          <TouchableOpacity
            key="applemusic-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Apple Music",
                is_apple_music_template: true,
              })
            }
          >
            <View style={styles.amThumb}>
              {/* Faux album art */}
              <View style={styles.amThumbAlbum}>
                <Ionicons
                  name="musical-notes"
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
              </View>
              <View style={styles.amThumbInfo}>
                <View style={styles.amThumbTitleLine} />
                <View
                  style={[
                    styles.amThumbTitleLine,
                    { width: "65%", height: 4, marginTop: 3 },
                  ]}
                />
              </View>
              {/* Mini playback controls */}
              <View style={styles.amThumbControls}>
                <Ionicons
                  name="play-skip-back"
                  size={8}
                  color="rgba(255,255,255,0.8)"
                />
                <View style={styles.amThumbPlayBtn}>
                  <Ionicons name="play" size={8} color="#fff" />
                </View>
                <Ionicons
                  name="play-skip-forward"
                  size={8}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            </View>
            <View style={styles.amThumbLabel}>
              <Text style={styles.amThumbLabelText}>Apple Music</Text>
            </View>
          </TouchableOpacity>

          {/* iMessage preset */}
          <TouchableOpacity
            key="imessage-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "iMessage",
                is_imessage_template: true,
              })
            }
          >
            <View style={styles.imessageThumb}>
              {/* Received bubble */}
              <View style={styles.imessageThumbReceived}>
                <Text style={styles.imessageThumbText} numberOfLines={2}>
                  The verse goes here...
                </Text>
              </View>
              {/* Sent bubble */}
              <View style={styles.imessageThumbSentRow}>
                <View style={styles.imessageThumbSent}>
                  <Text style={styles.imessageThumbSentText}>John 3:16</Text>
                </View>
              </View>
              <Text style={styles.imessageThumbDelivered}>Delivered</Text>
            </View>
            <View style={styles.imessageThumbLabel}>
              <Text style={styles.imessageThumbLabelText}>iMessage</Text>
            </View>
          </TouchableOpacity>

          {/* Calculator Notes preset */}
          <TouchableOpacity
            key="calc-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Calculator", is_calc_template: true })
            }
          >
            <View style={styles.calcThumb}>
              {/* Mini screen */}
              <View style={styles.calcThumbScreen}>
                <View style={styles.calcThumbTitleLine} />
                <View style={[styles.calcThumbBodyLine, { width: "90%" }]} />
                <View style={[styles.calcThumbBodyLine, { width: "75%" }]} />
                <View style={[styles.calcThumbBodyLine, { width: "60%" }]} />
              </View>
              {/* Mini keyboard rows */}
              <View style={styles.calcThumbKeys}>
                {[3, 3, 3].map((_, row) => (
                  <View key={row} style={styles.calcThumbKeyRow}>
                    {Array(5)
                      .fill(0)
                      .map((__, k) => (
                        <View key={k} style={styles.calcThumbKey} />
                      ))}
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.calcThumbLabel}>
              <Text style={styles.calcThumbLabelText}>TI-84</Text>
            </View>
          </TouchableOpacity>

          {/* Apple Notes preset */}
          <TouchableOpacity
            key="applenotes-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Apple Notes",
                is_apple_notes_template: true,
              })
            }
          >
            <View style={styles.appleNotesThumb}>
              {/* Mini note card */}
              <View style={styles.appleNotesThumbNote}>
                <View style={styles.appleNotesThumbHeader}>
                  <Text style={styles.appleNotesThumbBook}>Genesis</Text>
                  <Text style={styles.appleNotesThumbChapter}>1:1</Text>
                </View>
                <View style={styles.appleNotesThumbBody}>
                  <View style={styles.appleNotesThumbLine} />
                  <View
                    style={[styles.appleNotesThumbLine, { width: "85%" }]}
                  />
                  <View
                    style={[styles.appleNotesThumbLine, { width: "65%" }]}
                  />
                </View>
              </View>
            </View>
            <View style={styles.appleNotesThumbLabel}>
              <Text style={styles.appleNotesThumbLabelText}>Notes</Text>
            </View>
          </TouchableOpacity>

          {/* Mail preset */}
          <TouchableOpacity
            key="mail-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Mail", is_mail_template: true })
            }
          >
            <View style={styles.mailPresetThumbnail}>
              {/* Tan title bar */}
              <View style={styles.mailThumbTitleBar}>
                <Text style={styles.mailThumbTitle}>Anchor</Text>
              </View>
              {/* Menu row */}
              <View style={styles.mailThumbMenuRow}>
                {["Disc", "View", "Help"].map((m) => (
                  <Text key={m} style={styles.mailThumbMenu}>
                    {m}
                  </Text>
                ))}
              </View>
              {/* Fields */}
              <View style={styles.mailThumbField}>
                <Text style={styles.mailThumbFieldLabel}>To:</Text>
                <View style={styles.mailThumbFieldBox} />
              </View>
              <View style={styles.mailThumbField}>
                <Text style={styles.mailThumbFieldLabel}>Sub:</Text>
                <View style={styles.mailThumbFieldBox} />
              </View>
              {/* Body area */}
              <View style={styles.mailThumbBody}>
                <View style={styles.mailThumbBodyLine} />
                <View style={[styles.mailThumbBodyLine, { width: "80%" }]} />
                <View style={[styles.mailThumbBodyLine, { width: "90%" }]} />
              </View>
            </View>
            <View style={styles.mailPresetLabel}>
              <Text style={styles.mailPresetLabelText}>Mail</Text>
            </View>
          </TouchableOpacity>

          {/* Progress Bar preset */}
          <TouchableOpacity
            key="progressbar-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Progress Bar",
                is_progress_bar_template: true,
              })
            }
          >
            <View style={styles.pbThumbContainer}>
              <View style={styles.pbThumbIconRow}>
                <View style={styles.pbThumbIcon} />
              </View>
              <View style={styles.pbThumbPercent}>
                <Text style={styles.pbThumbPercentText}>65%</Text>
              </View>
              <View style={styles.pbThumbBarBg}>
                <View style={styles.pbThumbBarFill} />
              </View>
            </View>
            <View style={styles.pbThumbLabel}>
              <Text style={styles.pbThumbLabelText}>Progress</Text>
            </View>
          </TouchableOpacity>

          {/* Screen Time preset */}
          <TouchableOpacity
            key="screentime-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Screen Time",
                is_screen_time_template: true,
              })
            }
          >
            <View style={styles.stThumbContainer}>
              <View style={styles.stThumbHeader}>
                <View
                  style={[
                    styles.stThumbLine,
                    {
                      width: "55%",
                      height: 3,
                      backgroundColor: "rgba(255,255,255,0.5)",
                    },
                  ]}
                />
              </View>
              <View style={styles.stThumbBars}>
                {[0.3, 0.5, 0.6, 0.9, 0.4, 0.35, 0.2].map((h, i) => (
                  <View
                    key={i}
                    style={[styles.stThumbBar, { height: `${h * 100}%` }]}
                  />
                ))}
              </View>
              <View style={styles.stThumbDays}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <Text key={i} style={styles.stThumbDayText}>
                    {d}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.stThumbLabel}>
              <Text style={styles.stThumbLabelText}>Screen Time</Text>
            </View>
          </TouchableOpacity>

          {/* Notification preset */}
          <TouchableOpacity
            key="notification-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Notification",
                is_notification_template: true,
              })
            }
          >
            <View style={styles.notifThumbContainer}>
              <View style={styles.notifThumbBanner}>
                <View style={styles.notifThumbIcon} />
                <View style={{ flex: 1 }}>
                  <View
                    style={[styles.notifThumbLine, { width: "50%", height: 3 }]}
                  />
                </View>
                <View
                  style={[styles.notifThumbLine, { width: 12, height: 2 }]}
                />
              </View>
              <View style={styles.notifThumbBodyArea}>
                <View
                  style={[styles.notifThumbLine, { width: "85%", height: 2 }]}
                />
                <View
                  style={[styles.notifThumbLine, { width: "70%", height: 2 }]}
                />
              </View>
              <View style={styles.notifThumbGrabber} />
            </View>
            <View style={styles.notifThumbLabel}>
              <Text style={styles.notifThumbLabelText}>Notification</Text>
            </View>
          </TouchableOpacity>

          {/* Tweet preset */}
          <TouchableOpacity
            key="tweet-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Tweet", is_tweet_template: true })
            }
          >
            <View style={styles.tweetThumbContainer}>
              <View style={styles.tweetThumbHeader}>
                <View style={styles.tweetThumbAvatar} />
                <View style={{ flex: 1 }}>
                  <View
                    style={[
                      styles.tweetThumbLine,
                      { width: "60%", height: 3, marginBottom: 2 },
                    ]}
                  />
                  <View
                    style={[styles.tweetThumbLine, { width: "40%", height: 2 }]}
                  />
                </View>
              </View>
              <View style={styles.tweetThumbBody}>
                <View style={styles.tweetThumbLine} />
                <View style={[styles.tweetThumbLine, { width: "90%" }]} />
                <View style={[styles.tweetThumbLine, { width: "70%" }]} />
              </View>
              <View style={styles.tweetThumbActions}>
                <View style={styles.tweetThumbActionDot} />
                <View style={styles.tweetThumbActionDot} />
                <View style={styles.tweetThumbActionDot} />
                <View style={styles.tweetThumbActionDot} />
              </View>
            </View>
            <View style={styles.tweetThumbLabel}>
              <Text style={styles.tweetThumbLabelText}>Tweet</Text>
            </View>
          </TouchableOpacity>

          {/* Ticket Stub preset */}
          <TouchableOpacity
            key="ticketstub-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Ticket Stub",
                is_ticket_stub_template: true,
              })
            }
          >
            <View style={styles.ticketStubThumbContainer}>
              {/* Main body */}
              <View style={styles.ticketStubThumbTop}>
                <Text style={styles.ticketStubThumbTitle}>ANCHOR</Text>
                <View
                  style={{
                    height: 20,
                    backgroundColor: "#111",
                    marginBottom: 3,
                    borderRadius: 2,
                  }}
                />
                <View style={styles.ticketStubThumbLine} />
                <View style={[styles.ticketStubThumbLine, { width: "60%" }]} />
                <View style={styles.ticketStubThumbLine} />
              </View>
              {/* Tear line */}
              <View style={styles.ticketStubThumbTear} />
              {/* Stub */}
              <View style={styles.ticketStubThumbBottom}>
                <View style={styles.ticketStubThumbInfoRow}>
                  <View style={styles.ticketStubThumbInfoBox} />
                </View>
                <View style={styles.ticketStubThumbInfoRow}>
                  <View style={styles.ticketStubThumbInfoBox} />
                </View>
                <View style={styles.ticketStubThumbInfoRow}>
                  <View style={styles.ticketStubThumbInfoBox} />
                </View>
              </View>
            </View>
            <View style={styles.ticketStubThumbLabel}>
              <Text style={styles.ticketStubThumbLabelText}>Ticket Stub</Text>
            </View>
          </TouchableOpacity>

          {/* Nokia preset */}
          <TouchableOpacity
            key="nokia-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Nokia", is_nokia_template: true })
            }
          >
            <View style={styles.nokiaPresetThumbnail}>
              <View style={styles.nokiaThumbBody}>
                <View style={styles.nokiaThumbScreen}>
                  <Text style={styles.nokiaThumbSignal}>▂▄▆</Text>
                  <Text style={styles.nokiaThumbText}>Anchor</Text>
                  <View style={styles.nokiaThumbLine} />
                  <View style={[styles.nokiaThumbLine, { width: "70%" }]} />
                </View>
                <View style={styles.nokiaThumbKeypad}>
                  <View style={styles.nokiaThumbKeyRow}>
                    <View style={styles.nokiaThumbKey} />
                    <View style={styles.nokiaThumbKey} />
                    <View style={styles.nokiaThumbKey} />
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.nokiaPresetLabel}>
              <Text style={styles.nokiaPresetLabelText}>Nokia</Text>
            </View>
          </TouchableOpacity>

          {/* iPod preset */}
          <TouchableOpacity
            key="ipod-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "iPod", is_ipod_template: true })
            }
          >
            <View style={styles.ipodPresetThumbnail}>
              <View style={styles.ipodThumbScreen}>
                <Text style={styles.ipodThumbAnchor}>Anchor</Text>
                <View style={styles.ipodThumbRow}>
                  <View style={styles.ipodThumbBlueItem} />
                  <View style={styles.ipodThumbTextLines}>
                    <View style={styles.ipodThumbLine} />
                    <View style={[styles.ipodThumbLine, { width: "70%" }]} />
                  </View>
                </View>
              </View>
              <View style={styles.ipodThumbWheel} />
            </View>
            <View style={styles.ipodPresetLabel}>
              <Text style={styles.ipodPresetLabelText}>iPod</Text>
            </View>
          </TouchableOpacity>

          {/* XP Open preset */}
          <TouchableOpacity
            key="xpopen-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "XP Open", is_xp_open_template: true })
            }
          >
            <View style={styles.xpThumbContainer}>
              <View style={styles.xpThumbTitleBar}>
                <Text style={styles.xpThumbTitleText}>Open</Text>
                <Text style={styles.xpThumbX}>✕</Text>
              </View>
              <View style={styles.xpThumbBody}>
                <View style={styles.xpThumbSidebar}>
                  <View style={styles.xpThumbSideIcon} />
                  <View style={styles.xpThumbSideIcon} />
                  <View style={styles.xpThumbSideIcon} />
                </View>
                <View style={styles.xpThumbPreview}>
                  <Ionicons
                    name="image-outline"
                    size={16}
                    color="rgba(0,0,0,0.2)"
                  />
                </View>
              </View>
            </View>
            <View style={styles.xpThumbLabel}>
              <Text style={styles.xpThumbLabelText}>XP Open</Text>
            </View>
          </TouchableOpacity>

          {/* Postcard preset */}
          <TouchableOpacity
            key="postcard-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Postcard",
                is_postcard_template: true,
              })
            }
          >
            <View style={styles.pcThumbContainer}>
              <View style={styles.pcThumbBorder}>
                <Text style={styles.pcThumbGreetings}>Greetings from...</Text>
                <Text style={styles.pcThumbBook}>BOOK</Text>
                <Text style={styles.pcThumbVerse}>1:1</Text>
              </View>
            </View>
            <View style={styles.pcThumbLabel}>
              <Text style={styles.pcThumbLabelText}>Postcard</Text>
            </View>
          </TouchableOpacity>

          {/* Comic preset */}
          <TouchableOpacity
            key="comic-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Comic", is_comic_template: true })
            }
          >
            <View style={styles.comicThumbContainer}>
              <View style={styles.comicThumbBubble}>
                <View style={[styles.comicThumbLine, { width: "90%" }]} />
                <View style={[styles.comicThumbLine, { width: "70%" }]} />
                <View style={[styles.comicThumbLine, { width: "50%" }]} />
              </View>
              <View style={styles.comicThumbTail} />
              <View style={styles.comicThumbCaption}>
                <View
                  style={[
                    styles.comicThumbLine,
                    { width: "60%", backgroundColor: "rgba(0,0,0,0.2)" },
                  ]}
                />
              </View>
            </View>
            <View style={styles.comicThumbLabel}>
              <Text style={styles.comicThumbLabelText}>Comic</Text>
            </View>
          </TouchableOpacity>

          {/* Sticky Note preset */}
          <TouchableOpacity
            key="stickynote-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Sticky Note",
                is_sticky_note_template: true,
              })
            }
          >
            <View style={styles.snThumbContainer}>
              <View style={styles.snThumbPin} />
              <View style={styles.snThumbNote}>
                <View style={[styles.snThumbLine, { width: "90%" }]} />
                <View style={[styles.snThumbLine, { width: "75%" }]} />
                <View style={[styles.snThumbLine, { width: "60%" }]} />
              </View>
            </View>
            <View style={styles.snThumbLabel}>
              <Text style={styles.snThumbLabelText}>Sticky Note</Text>
            </View>
          </TouchableOpacity>

          {/* Highway Sign preset */}
          <TouchableOpacity
            key="highway-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Highway Sign",
                is_highway_template: true,
              })
            }
          >
            <View style={styles.hwThumbContainer}>
              <View style={styles.hwThumbShield}>
                <Text style={styles.hwThumbShieldBook}>JOHN</Text>
                <View style={styles.hwThumbShieldRed}>
                  <Text style={styles.hwThumbShieldNum}>3:16</Text>
                </View>
              </View>
              <View style={[styles.hwThumbLine, { width: "85%" }]} />
              <View style={[styles.hwThumbLine, { width: "70%" }]} />
              <View style={[styles.hwThumbLine, { width: "55%" }]} />
            </View>
            <View style={styles.hwThumbLabel}>
              <Text style={styles.hwThumbLabelText}>Highway</Text>
            </View>
          </TouchableOpacity>

          {/* Anchor Search preset - always shown first */}
          <TouchableOpacity
            key="anchor-search-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Anchor Search",
                is_search_template: true,
              })
            }
          >
            <View style={styles.searchPresetThumbnail}>
              <Text style={styles.searchPresetLogoThumb}>
                <Text style={{ color: "#4285F4" }}>A</Text>
                <Text style={{ color: "#EA4335" }}>n</Text>
                <Text style={{ color: "#FBBC05" }}>c</Text>
                <Text style={{ color: "#4285F4" }}>h</Text>
                <Text style={{ color: "#34A853" }}>o</Text>
                <Text style={{ color: "#EA4335" }}>r</Text>
              </Text>
              <View style={styles.searchPresetBar} />
              <View style={styles.searchPresetLine} />
              <View style={[styles.searchPresetLine, { width: "60%" }]} />
            </View>
            <View style={styles.searchPresetLabel}>
              <Ionicons name="search" size={12} color="#4285F4" />
              <Text style={styles.searchPresetLabelText}>Search</Text>
            </View>
          </TouchableOpacity>

          {/* Monopoly Title Deed preset */}
          <TouchableOpacity
            key="monopoly-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "Monopoly",
                is_monopoly_template: true,
              })
            }
          >
            <View style={styles.monoThumbContainer}>
              <View style={styles.monoThumbFrame}>
                <View style={styles.monoThumbBand}>
                  <Text style={styles.monoThumbName}>PARK PL.</Text>
                </View>
                <View style={styles.monoThumbBody}>
                  <View style={styles.monoThumbLine} />
                  <View style={[styles.monoThumbLine, { width: "70%" }]} />
                  <View style={styles.monoThumbLine} />
                  <View style={[styles.monoThumbLine, { width: "80%" }]} />
                </View>
              </View>
            </View>
            <View style={styles.monoThumbLabel}>
              <Text style={styles.monoThumbLabelText}>Monopoly</Text>
            </View>
          </TouchableOpacity>

          {/* App Store preset */}
          <TouchableOpacity
            key="appstore-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({
                name: "App Store",
                is_app_store_template: true,
              })
            }
          >
            <View style={styles.asThumbContainer}>
              <View style={styles.asThumbTop}>
                <View style={styles.asThumbIcon}>
                  <AnchorLogo size={18} color="#fff" />
                </View>
                <View style={{ flex: 1, gap: 3, paddingLeft: 5 }}>
                  <View style={styles.asThumbNameLine} />
                  <View style={[styles.asThumbNameLine, { width: "60%" }]} />
                </View>
                <View style={styles.asThumbGet}>
                  <Text style={styles.asThumbGetText}>GET</Text>
                </View>
              </View>
              <View style={styles.asThumbDivider} />
              <View style={{ gap: 2 }}>
                <View style={styles.asThumbLine} />
                <View style={[styles.asThumbLine, { width: "80%" }]} />
                <View style={styles.asThumbLine} />
              </View>
            </View>
            <View style={styles.asThumbLabel}>
              <Text style={styles.asThumbLabelText}>App Store</Text>
            </View>
          </TouchableOpacity>

          {/* Warning sign preset */}
          <TouchableOpacity
            key="warning-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Warning", is_warning_template: true })
            }
          >
            <View style={styles.warnThumbContainer}>
              <View style={styles.warnThumbBand}>
                <AnchorLogo size={10} color="#111" />
                <Text style={styles.warnThumbBandText}>WARNING</Text>
              </View>
              <View style={styles.warnThumbBody}>
                <View
                  style={[
                    styles.warnThumbLine,
                    { width: "50%", marginBottom: 3 },
                  ]}
                />
                <View style={styles.warnThumbLine} />
                <View style={[styles.warnThumbLine, { width: "80%" }]} />
                <View style={styles.warnThumbLine} />
              </View>
            </View>
            <View style={styles.warnThumbLabel}>
              <Text style={styles.warnThumbLabelText}>Warning</Text>
            </View>
          </TouchableOpacity>

          {/* Revival poster preset */}
          <TouchableOpacity
            key="revival-local"
            style={styles.presetCard}
            onPress={() =>
              handleSelectPreset({ name: "Revival", is_revival_template: true })
            }
          >
            <View style={styles.revThumbContainer}>
              <Text style={styles.revThumbTitle}>REVIVAL</Text>
              <View style={styles.revThumbDivider} />
              <View style={styles.revThumbGrid}>
                <View style={{ flex: 1 }}>
                  <View style={styles.revThumbLineShort} />
                  <View
                    style={[
                      styles.revThumbLineShort,
                      { width: "60%", marginTop: 2 },
                    ]}
                  />
                </View>
                <View style={styles.revThumbGridDivider} />
                <View style={{ flex: 1, paddingLeft: 4 }}>
                  <View style={[styles.revThumbLineShort, { width: "40%" }]} />
                  <View style={styles.revThumbLineShort} />
                </View>
              </View>
              <View style={styles.revThumbColorBar} />
            </View>
            <View style={styles.revThumbLabel}>
              <Text style={styles.revThumbLabelText}>Revival</Text>
            </View>
          </TouchableOpacity>

          {presets.length > 0 ? (
            presets
              .filter(
                (preset) =>
                  preset.is_frame_template ||
                  (preset.image_url && preset.image_url.trim() !== ""),
              )
              .filter((preset) => !brokenPresetIds.has(preset.id))
              .map((preset, index) => (
                <TouchableOpacity
                  key={preset.id || index}
                  style={styles.presetCard}
                  onPress={() => handleSelectPreset(preset)}
                >
                  {preset.is_frame_template ? (
                    <View style={styles.polaroidThumbOuter}>
                      <View style={styles.polaroidThumbPhoto}>
                        <View style={styles.polaroidThumbPhotoOverlay}>
                          <Ionicons
                            name="image-outline"
                            size={22}
                            color="rgba(255,255,255,0.6)"
                          />
                        </View>
                      </View>
                      <View style={styles.polaroidThumbBottom}>
                        <View style={styles.polaroidThumbDateLine} />
                        <View style={styles.polaroidThumbTextLine} />
                        <View
                          style={[
                            styles.polaroidThumbTextLine,
                            { width: "55%" },
                          ]}
                        />
                      </View>
                      <View style={styles.polaroidThumbBadge}>
                        <Text style={styles.polaroidThumbBadgeText}>
                          Polaroid
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: preset.image_url }}
                      style={styles.presetImage}
                      resizeMode="cover"
                      onError={() =>
                        setBrokenPresetIds(
                          (prev) => new Set([...prev, preset.id]),
                        )
                      }
                    />
                  )}
                </TouchableOpacity>
              ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="images-outline"
                size={48}
                color="#6b7280"
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.emptyText}>
                {loadError ? "Failed to load presets" : "No presets available"}
              </Text>
              {loadError && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchPresets(0)}
                >
                  <Ionicons name="refresh" size={20} color="#ffffff" />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderStrokedText = (text: string, style: any) => {
    // Preset font takes priority, then user-selected font
    const textColor = selectedPreset?.text_color || "#ffffff";
    const fontFamily = selectedPreset?.font_family || selectedFont || undefined;

    const customStyle = {
      ...(fontFamily && { fontFamily }),
      color: textColor,
    };

    if (strokeEnabled) {
      const strokeStyle = [style, fontFamily ? { fontFamily } : {}];
      return (
        <View style={{ position: "relative" }}>
          <Text
            style={[
              ...strokeStyle,
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
              ...strokeStyle,
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
              ...strokeStyle,
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
              ...strokeStyle,
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
              ...strokeStyle,
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
              ...strokeStyle,
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
              ...strokeStyle,
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
              ...strokeStyle,
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
          <Text
            style={[...strokeStyle, { color: "#ffffff", fontWeight: "700" }]}
          >
            {text}
          </Text>
        </View>
      );
    }
    return (
      <Text style={[style, customStyle, { fontWeight: "400" }]}>{text}</Text>
    );
  };

  const renderPreview = () => {
    // Special rendering for HTML template
    if (isHtmlTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      // Split verse into ~3 CSS-style "property" lines
      const words = verseText.split(" ");
      const third = Math.ceil(words.length / 3);
      const line1 = words.slice(0, third).join(" ");
      const line2 = words.slice(third, third * 2).join(" ");
      const line3 = words.slice(third * 2).join(" ");

      return (
        <View style={styles.htmlFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.htmlBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#00ffff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.htmlScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Capturable card */}
            <View
              ref={htmlCaptureRef}
              style={styles.htmlCard}
              collapsable={false}
            >
              {/* Glow button */}
              <View style={styles.htmlGlowWrapper}>
                <View style={styles.htmlGlowButton}>
                  <Text style={styles.htmlGlowButtonText}>{reference}</Text>
                </View>
              </View>

              {/* HTML code block */}
              <View style={styles.htmlCodeBlock}>
                <View style={styles.htmlTrafficLights}>
                  <View
                    style={[styles.htmlDot, { backgroundColor: "#ff5f57" }]}
                  />
                  <View
                    style={[styles.htmlDot, { backgroundColor: "#febc2e" }]}
                  />
                  <View
                    style={[styles.htmlDot, { backgroundColor: "#28c840" }]}
                  />
                </View>
                <Text style={styles.htmlCodeLine}>
                  <Text style={styles.htmlTag}>{"<button>"}</Text>
                  <Text style={styles.htmlTagContent}>{reference}</Text>
                  <Text style={styles.htmlTag}>{"</button>"}</Text>
                </Text>
              </View>

              {/* CSS code block */}
              <View style={styles.htmlCodeBlock}>
                <View style={styles.htmlTrafficLights}>
                  <View
                    style={[styles.htmlDot, { backgroundColor: "#ff5f57" }]}
                  />
                  <View
                    style={[styles.htmlDot, { backgroundColor: "#febc2e" }]}
                  />
                  <View
                    style={[styles.htmlDot, { backgroundColor: "#28c840" }]}
                  />
                </View>
                <Text style={styles.htmlCodeLine}>
                  <Text style={styles.htmlSelector}>{"button"}</Text>
                  <Text style={styles.htmlBrace}>{" {"}</Text>
                </Text>
                <Text style={styles.htmlCodeLine}>
                  {"  "}
                  <Text style={styles.htmlProp}>{"verse: "}</Text>
                  <Text style={styles.htmlValue}>{`"${line1}"`}</Text>
                  <Text style={styles.htmlPunct}>{","}</Text>
                </Text>
                {line2 ? (
                  <Text style={styles.htmlCodeLine}>
                    {"  "}
                    <Text style={styles.htmlValue}>{`"${line2}"`}</Text>
                    <Text style={styles.htmlPunct}>{","}</Text>
                  </Text>
                ) : null}
                {line3 ? (
                  <Text style={styles.htmlCodeLine}>
                    {"  "}
                    <Text style={styles.htmlValue}>{`"${line3}"`}</Text>
                    <Text style={styles.htmlPunct}>{";"}</Text>
                  </Text>
                ) : null}
                <Text style={styles.htmlCodeLine}>
                  <Text style={styles.htmlBrace}>{"}"}</Text>
                </Text>
                <Text style={[styles.htmlCodeLine, { marginTop: 6 }]}>
                  <Text style={styles.htmlSelector}>{"button:hover"}</Text>
                  <Text style={styles.htmlBrace}>{" {"}</Text>
                </Text>
                <Text style={styles.htmlCodeLine}>
                  {"  "}
                  <Text style={styles.htmlProp}>{"box-shadow: "}</Text>
                  <Text style={styles.htmlValue}>{"0 0 5px "}</Text>
                  <Text style={styles.htmlCyan}>{"cyan"}</Text>
                  <Text style={styles.htmlPunct}>{","}</Text>
                </Text>
                <Text style={styles.htmlCodeLine}>
                  {"  "}
                  <Text style={styles.htmlValue}>{"0 0 25px "}</Text>
                  <Text style={styles.htmlCyan}>{"cyan"}</Text>
                  <Text style={styles.htmlPunct}>{","}</Text>
                  <Text style={styles.htmlValue}>{" 0 0 50px "}</Text>
                  <Text style={styles.htmlCyan}>{"cyan"}</Text>
                  <Text style={styles.htmlPunct}>{","}</Text>
                </Text>
                <Text style={styles.htmlCodeLine}>
                  {"  "}
                  <Text style={styles.htmlValue}>{"0 0 100px "}</Text>
                  <Text style={styles.htmlCyan}>{"cyan"}</Text>
                  <Text style={styles.htmlPunct}>{";"}</Text>
                </Text>
                <Text style={styles.htmlCodeLine}>
                  <Text style={styles.htmlBrace}>{"}"}</Text>
                </Text>
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Windows 95 template
    if (isWin95Template && win95PhotoUrl) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      return (
        <View style={styles.win95FullContainer}>
          {/* Back button */}
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.win95BackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Capturable card */}
          <View
            ref={win95CaptureRef}
            style={styles.win95Card}
            collapsable={false}
          >
            {/* Background photo */}
            <Image
              source={{ uri: win95PhotoUrl }}
              style={styles.win95BgPhoto}
              resizeMode="cover"
            />

            {/* Floating Windows 95 dialog */}
            <View style={styles.win95Dialog}>
              {/* Title bar */}
              <View style={styles.win95TitleBar}>
                <Text style={styles.win95TitleText}>{reference}</Text>
                <View style={styles.win95TitleButtons}>
                  <View style={styles.win95TitleBtn}>
                    <Text style={styles.win95TitleBtnText}>_</Text>
                  </View>
                  <View style={styles.win95TitleBtn}>
                    <Text style={styles.win95TitleBtnText}>□</Text>
                  </View>
                  <View style={[styles.win95TitleBtn, styles.win95CloseBtnBg]}>
                    <Text style={styles.win95TitleBtnText}>✕</Text>
                  </View>
                </View>
              </View>

              {/* Dialog body */}
              <View style={styles.win95DialogBody}>
                {/* Warning icon + verse text side by side */}
                <View style={styles.win95ContentRow}>
                  <View style={styles.win95IconWrap}>
                    <View style={styles.win95IconOuter}>
                      <Image
                        source={require("../assets/icon.png")}
                        style={styles.win95IconImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                  <Text style={styles.win95VerseText}>{verseText}</Text>
                </View>

                {/* Separator */}
                <View style={styles.win95BodySeparator} />

                {/* OK button */}
                <View style={styles.win95ButtonRow}>
                  <View style={styles.win95OkButton}>
                    <Text style={styles.win95OkText}>OK</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Mac OS template
    if (isMacOsTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;
      const menuLabel = `${bookTitle} ${chapterVerse}`.toUpperCase();

      // Split verse into menu-item-width chunks (~30 chars each)
      const words = verseText.split(" ");
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        if ((current + (current ? " " : "") + word).length > 30) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = current ? `${current} ${word}` : word;
        }
      }
      if (current) lines.push(current);

      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.macosBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 32,
              alignItems: "center",
            }}
          >
            {/* Capturable area */}
            <View
              ref={macOsCaptureRef}
              collapsable={false}
              style={styles.macosFullContainer}
            >
              {/* Desktop */}
              <View style={styles.macosDesktop}>
                {/* Menu bar */}
                <View style={styles.macosMenuBar}>
                  <Text style={styles.macosDiamond}>◇</Text>
                  <View style={styles.macosMenuActiveItem}>
                    <Text style={styles.macosMenuActiveText}>{menuLabel}</Text>
                  </View>
                  <Text style={styles.macosMenuOtherItem}>Edit</Text>
                  <Text style={styles.macosMenuOtherItem}>View</Text>
                  <Text style={styles.macosMenuOtherItem}>Label</Text>
                  <Text style={styles.macosMenuOtherItem}>Special</Text>
                </View>
                {/* Desktop area with icons */}
                <View style={styles.macosDesktopArea}>
                  {/* Hard drive icon top-right */}
                  <View style={styles.macosIconTopRight}>
                    <View style={styles.macosHDIcon}>
                      <View style={styles.macosHDIconInner} />
                    </View>
                    <Text style={styles.macosIconLabel}>Anchor HD</Text>
                  </View>
                  {/* Dropdown menu */}
                  <View style={styles.macosDropdown}>
                    {lines.map((line, i) => (
                      <View key={i}>
                        <Text style={styles.macosDropdownItem}>{line}</Text>
                        {i < lines.length - 1 && (
                          <View style={styles.macosDropdownDivider} />
                        )}
                      </View>
                    ))}
                    <View style={styles.macosDropdownSeparator} />
                    <Text style={styles.macosDropdownFooter}>
                      — Anchor Bible App
                    </Text>
                  </View>
                  {/* Trash icon bottom-right */}
                  <View style={styles.macosIconBottomRight}>
                    <View style={styles.macosTrashIcon}>
                      <View style={styles.macosTrashLid} />
                      <View style={styles.macosTrashBody}>
                        <View style={styles.macosTrashLine} />
                        <View style={styles.macosTrashLine} />
                        <View style={styles.macosTrashLine} />
                      </View>
                    </View>
                    <Text style={styles.macosIconLabel}>Trash</Text>
                  </View>
                </View>
              </View>
            </View>
            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for AirDrop template
    if (isAirdropTemplate && airdropPhotoUrl) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;
      const cardWidth = SCREEN_WIDTH - 56;

      return (
        <View style={styles.airdropFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.airdropBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.airdropScrollContent}
            showsVerticalScrollIndicator={false}
            style={{ width: "100%" }}
          >
            <View
              ref={airdropCaptureRef}
              style={[styles.airdropCard, { width: cardWidth }]}
              collapsable={false}
            >
              {/* Header — reference */}
              <View style={styles.airdropCardHeader}>
                <Text
                  style={styles.airdropCardTitle}
                >{`${bookTitle} ${chapterVerse}`}</Text>
                <Text style={styles.airdropCardSubtitle}>{verseText}</Text>
              </View>

              {/* Photo area */}
              <Image
                source={{ uri: airdropPhotoUrl }}
                style={[styles.airdropCardPhoto, { width: cardWidth }]}
                resizeMode="cover"
              />

              {/* Footer — Decline / Accept */}
              <View style={styles.airdropCardFooter}>
                <Text style={styles.airdropDeclineBtn}>Decline</Text>
                <View style={styles.airdropFooterDivider} />
                <Text style={styles.airdropAcceptBtn}>Accept</Text>
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for XP Open template
    if (isXpOpenTemplate && xpPhotoUrl) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;
      const fileName = `${bookTitle}_${chapterVerse.replace(":", "-")}.jpg`;

      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.xpBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 32,
              alignItems: "center",
            }}
          >
            <View
              ref={xpOpenCaptureRef}
              collapsable={false}
              style={styles.xpContainer}
            >
              {/* The window */}
              <View style={styles.xpWindow}>
                {/* Title bar */}
                <View style={styles.xpTitleBar}>
                  <View style={styles.xpTitleBarLeft}>
                    <Ionicons name="folder-open" size={14} color="#fff" />
                    <Text style={styles.xpTitleText}>Open</Text>
                  </View>
                  <View style={styles.xpTitleBarButtons}>
                    <View style={styles.xpTitleBtn}>
                      <Text style={styles.xpTitleBtnText}>?</Text>
                    </View>
                    <View style={[styles.xpTitleBtn, styles.xpCloseBtn]}>
                      <Text style={styles.xpCloseBtnText}>✕</Text>
                    </View>
                  </View>
                </View>

                {/* Toolbar */}
                <View style={styles.xpToolbar}>
                  <Text style={styles.xpToolbarLabel}>Look in:</Text>
                  <View style={styles.xpToolbarDropdown}>
                    <Ionicons name="folder" size={14} color="#E8C84A" />
                    <Text style={styles.xpToolbarDropdownText}>
                      My Pictures
                    </Text>
                  </View>
                </View>

                {/* Content area */}
                <View style={styles.xpContentRow}>
                  {/* Sidebar */}
                  <View style={styles.xpSidebar}>
                    {[
                      { icon: "time-outline", label: "Recent" },
                      { icon: "desktop-outline", label: "Desktop" },
                      { icon: "document-outline", label: "My Docs" },
                      { icon: "laptop-outline", label: "My PC" },
                      { icon: "globe-outline", label: "Network" },
                    ].map((item, i) => (
                      <View key={i} style={styles.xpSidebarItem}>
                        <Ionicons
                          name={item.icon as any}
                          size={20}
                          color="#336"
                        />
                        <Text style={styles.xpSidebarLabel}>{item.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Photo preview area */}
                  <View style={styles.xpPreviewArea}>
                    <Image
                      source={{ uri: xpPhotoUrl }}
                      style={styles.xpPhoto}
                      resizeMode="cover"
                    />
                    {/* Verse overlay on photo */}
                    <View style={styles.xpVerseOverlay}>
                      <Text style={styles.xpVerseText}>{verseText}</Text>
                      <Text style={styles.xpVerseRef}>— {reference}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom bar */}
                <View style={styles.xpBottomBar}>
                  <View style={styles.xpBottomRow}>
                    <Text style={styles.xpBottomLabel}>File name:</Text>
                    <View style={styles.xpBottomInput}>
                      <Text style={styles.xpBottomInputText}>{fileName}</Text>
                    </View>
                    <View style={styles.xpOpenBtn}>
                      <Text style={styles.xpOpenBtnText}>Open</Text>
                    </View>
                  </View>
                  <View style={styles.xpBottomRow}>
                    <Text style={styles.xpBottomLabel}>Files of type:</Text>
                    <View style={styles.xpBottomInput}>
                      <Text style={styles.xpBottomInputText}>
                        All Picture Files
                      </Text>
                    </View>
                    <View style={styles.xpCancelBtn}>
                      <Text style={styles.xpCancelBtnText}>Cancel</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Postcard template
    if (isPostcardTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;

      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.pcBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 32,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPostcardFlipped(!postcardFlipped)}
            >
              <View ref={postcardCaptureRef} collapsable={false}>
                {!postcardFlipped ? (
                  /* ── FRONT SIDE ── */
                  <View style={styles.pcCardFront}>
                    <View style={styles.pcFrontInner}>
                      {/* Decorative sparkles */}
                      <Text style={styles.pcSparkle1}>✦</Text>
                      <Text style={styles.pcSparkle2}>✦</Text>
                      <Text style={styles.pcSparkle3}>✧</Text>
                      <Text style={styles.pcSparkle4}>✦</Text>
                      <Text style={styles.pcSparkle5}>✧</Text>

                      <Text style={styles.pcGreetingsText}>
                        Greetings from...
                      </Text>
                      <Text style={styles.pcBookName}>{bookTitle}</Text>
                      <Text style={styles.pcChapterVerse}>{chapterVerse}</Text>

                      <View style={styles.pcFrontFooter}>
                        <Text style={styles.pcFrontFooterText}>
                          Anchor Bible App
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* ── BACK SIDE ── */
                  <View style={styles.pcCardBack}>
                    {/* Stamp area */}
                    <View style={styles.pcStampArea}>
                      <View style={styles.pcStamp}>
                        <Text style={styles.pcStampText}>⚓</Text>
                      </View>
                    </View>

                    {/* Postmark circle */}
                    <View style={styles.pcPostmark}>
                      <Text style={styles.pcPostmarkText}>ANCHOR</Text>
                      <Text style={styles.pcPostmarkDate}>BIBLE APP</Text>
                    </View>

                    {/* Center divider */}
                    <View style={styles.pcCenterDivider} />

                    {/* Left side - verse */}
                    <View style={styles.pcLeftSide}>
                      <Text style={styles.pcVerseText}>{`"${verseText}"`}</Text>
                      <Text style={styles.pcVerseRef}>— {reference}</Text>
                    </View>

                    {/* Right side - address lines */}
                    <View style={styles.pcRightSide}>
                      <View style={styles.pcAddressLine} />
                      <View style={styles.pcAddressLine} />
                      <View style={styles.pcAddressLine} />
                      <View style={[styles.pcAddressLine, { width: "60%" }]} />
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Flip hint */}
            <Text style={styles.pcFlipHint}>
              Tap to flip {postcardFlipped ? "to front" : "to back"}
            </Text>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Comic template
    if (isComicTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.comicBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 32,
              alignItems: "center",
            }}
          >
            <View
              ref={comicCaptureRef}
              collapsable={false}
              style={styles.comicPanel}
            >
              {/* Halftone dots pattern */}
              {Array.from({ length: 120 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.comicDot,
                    {
                      top: `${(i * 13 + 3) % 100}%`,
                      left: `${(i * 19 + 7) % 100}%`,
                      width: (i % 4) + 3,
                      height: (i % 4) + 3,
                      opacity: 0.06 + (i % 3) * 0.02,
                    },
                  ]}
                />
              ))}

              {/* Speech bubble */}
              <View style={styles.comicBubble}>
                <Text style={styles.comicBubbleText}>
                  {verseText.toUpperCase()}
                </Text>
              </View>
              {/* Bubble tail */}
              <View style={styles.comicBubbleTail} />
              <View style={styles.comicBubbleTailInner} />

              {/* Caption box at bottom */}
              <View style={styles.comicCaption}>
                <Text style={styles.comicCaptionText}>{reference}</Text>
                <Text style={styles.comicCaptionSub}>Anchor Bible App</Text>
              </View>
            </View>
            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Sticky Note template
    if (isStickyNoteTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.snBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 32,
              alignItems: "center",
            }}
          >
            <View
              ref={stickyNoteCaptureRef}
              collapsable={false}
              style={styles.snBoardContainer}
            >
              {/* Cork board background */}
              <View style={styles.snCorkBoard}>
                {/* Cork texture dots */}
                {Array.from({ length: 80 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.snCorkDot,
                      {
                        top: `${(i * 17 + 7) % 100}%`,
                        left: `${(i * 23 + 11) % 100}%`,
                        width: (i % 3) + 2,
                        height: (i % 3) + 2,
                        opacity: 0.15 + (i % 5) * 0.05,
                      },
                    ]}
                  />
                ))}

                {/* Sticky note */}
                <View style={styles.snNote}>
                  {/* Faint ruled lines */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.snRuledLine, { top: 38 + i * 24 }]}
                    />
                  ))}

                  {/* Verse text in handwriting */}
                  <Text style={styles.snVerseText}>{`"${verseText}"`}</Text>

                  {/* Reference */}
                  <Text style={styles.snReference}>— {reference}</Text>

                  {/* Slight fold/shadow bottom-right */}
                  <View style={styles.snFoldCorner} />
                </View>
              </View>
            </View>
            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Highway Sign template
    if (isHighwayTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;

      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.hwBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 32,
              alignItems: "center",
            }}
          >
            <View
              ref={highwayCaptureRef}
              collapsable={false}
              style={styles.hwSignContainer}
            >
              {/* Inner reflective border */}
              <View style={styles.hwInnerBorder}>
                {/* Interstate shield - centered at top */}
                <View style={styles.hwShieldRow}>
                  <View style={styles.hwShieldOuter}>
                    {/* Blue top section */}
                    <View style={styles.hwShieldBlueTop}>
                      <Text style={styles.hwShieldBookName}>
                        {bookTitle.toUpperCase()}
                      </Text>
                    </View>
                    {/* Red bottom section with chapter:verse */}
                    <View style={styles.hwShieldRedBottom}>
                      <Text style={styles.hwShieldNumber}>{chapterVerse}</Text>
                    </View>
                  </View>
                </View>

                {/* Verse text (large, like city destination) */}
                <Text style={styles.hwDestinationMain}>{verseText}</Text>

                {/* Footer */}
                <View style={styles.hwFooterRow}>
                  <Text style={styles.hwFooterText}>Anchor Bible App</Text>
                </View>
              </View>
            </View>
            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Receipt template
    if (isReceiptTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;

      // Split verse into receipt line items (~32 chars each)
      const words = verseText.split(" ");
      const receiptLines: string[] = [];
      let currentLine = "";
      for (const word of words) {
        if ((currentLine + " " + word).trim().length > 32) {
          if (currentLine) receiptLines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine = (currentLine + " " + word).trim();
        }
      }
      if (currentLine) receiptLines.push(currentLine.trim());

      // Fake barcode bars: alternating wide/narrow black bars
      const barPattern = [
        3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 1, 1, 3, 2,
        1, 3, 1, 2, 1, 2, 3, 1, 2, 1,
      ];

      return (
        <View style={styles.receiptFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.receiptBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.receiptScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={receiptCaptureRef}
              style={styles.receiptPaper}
              collapsable={false}
            >
              {/* Book + Chapter:Verse big header */}
              <Text
                style={styles.receiptStoreHeader}
              >{`${bookTitle.toUpperCase()}`}</Text>
              <Text style={styles.receiptStoreHeader}>{chapterVerse}</Text>
              <Text style={styles.receiptSubtag}>JESUS PAID IT ALL</Text>

              <View style={styles.receiptSpacer} />

              {/* Verse text */}
              {receiptLines.map((line, i) => (
                <Text key={i} style={styles.receiptVerseLineItem}>
                  {line.toUpperCase()}
                </Text>
              ))}

              <View style={styles.receiptSpacer} />

              {/* Spiritual line items */}
              {[
                "SIN",
                "SHAME",
                "REGRET",
                "PAST MISTAKES",
                "UNFORGIVENESS",
                "HURT",
                "ANGER",
              ].map((item) => (
                <View key={item} style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemName}>{item}</Text>
                  <Text style={styles.receiptItemPaid}>PAID</Text>
                </View>
              ))}

              {/* === divider */}
              <Text style={styles.receiptEquals}>{"=".repeat(34)}</Text>

              {/* Debt / Change */}
              <View style={styles.receiptItemRow}>
                <Text style={styles.receiptItemName}>DEBT</Text>
                <Text style={styles.receiptItemPaid}>PAID</Text>
              </View>
              <View style={styles.receiptItemRow}>
                <Text style={styles.receiptItemName}>CHANGE</Text>
                <Text style={styles.receiptItemName}>0.00</Text>
              </View>

              {/* === divider */}
              <Text style={styles.receiptEquals}>{"=".repeat(34)}</Text>

              {/* Subtotal / Grand total */}
              <View style={styles.receiptItemRow}>
                <Text style={styles.receiptSubtotalLabel}>Subtotal</Text>
                <Text style={styles.receiptSubtotalValue}>0.00</Text>
              </View>
              <View style={styles.receiptItemRow}>
                <Text style={styles.receiptGrandLabel}>GRAND TOTAL</Text>
                <Text style={styles.receiptGrandValue}>0.00</Text>
              </View>

              {/* Card number */}
              <Text style={styles.receiptCardNum}>
                {"*********0000  XX/XX"}
              </Text>

              <View style={styles.receiptSpacer} />

              {/* Barcode */}
              <View style={styles.receiptBarcodeContainer}>
                {barPattern.map((w, i) =>
                  i % 2 === 0 ? (
                    <View
                      key={i}
                      style={[styles.receiptBar, { width: w * 2.5 }]}
                    />
                  ) : (
                    <View key={i} style={{ width: w * 1.5 }} />
                  ),
                )}
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Retro Game template
    if (isRetroGameTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      // Split verse into lines for the menu-item effect
      const words = verseText.split(" ");
      const lines: string[] = [];
      let current = "";
      words.forEach((word) => {
        if ((current + " " + word).trim().length <= 22) {
          current = (current + " " + word).trim();
        } else {
          if (current) lines.push(current);
          current = word;
        }
      });
      if (current) lines.push(current);

      return (
        <View style={styles.retroFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.retroBackBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>

          <View
            ref={retroGameCaptureRef}
            style={styles.retroCard}
            collapsable={false}
          >
            {/* CRT scanlines — alternating horizontal bands */}
            <View style={styles.retroScanlines} pointerEvents="none">
              {Array(120)
                .fill(0)
                .map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.retroScanline,
                      { opacity: i % 2 === 0 ? 0.22 : 0 },
                    ]}
                  />
                ))}
            </View>

            {/* Vignette — dark edges like CRT */}
            <View style={styles.retroVignette} pointerEvents="none" />

            {/* Red sun / half circle */}
            <View style={styles.retroSunContainer}>
              <View style={styles.retroSun} />
            </View>

            {/* Title — reference with glitch text effect */}
            <View style={styles.retroTitleContainer}>
              <Text style={styles.retroTitle}>{reference.toUpperCase()}</Text>
              <View style={styles.retroTitleUnderline} />
            </View>

            {/* Verse as menu items */}
            <View style={styles.retroMenuContainer}>
              {lines.map((line, i) => (
                <View key={i} style={styles.retroMenuItem}>
                  {i === 0 && <Text style={styles.retroMenuArrow}>▶ </Text>}
                  {i !== 0 && <Text style={styles.retroMenuArrow}> </Text>}
                  <Text style={styles.retroMenuText}>{line.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for VHS template
    if (isVhsTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;

      const stripeColors = [
        "#f5c518",
        "#f09020",
        "#e05818",
        "#c83020",
        "#a02828",
        "#701828",
      ];

      return (
        <View style={styles.vhsFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.vhsBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View ref={vhsCaptureRef} style={styles.vhsCard} collapsable={false}>
            {/* === TOP SECTION === */}
            <View style={styles.vhsTop}>
              {/* ANCHOR logo top-left */}
              <Text style={styles.vhsSonyLogo}>ANCHOR</Text>

              {/* Dot grid + "It's a Sony" top-right */}
              <View style={styles.vhsDotBlock}>
                <View style={styles.vhsDotGrid}>
                  {Array(15)
                    .fill(0)
                    .map((_, i) => (
                      <View key={i} style={styles.vhsDot} />
                    ))}
                </View>
                <Text style={styles.vhsItsSony}>It's Anchor</Text>
              </View>
            </View>

            {/* === TITLE SECTION === */}
            <View style={styles.vhsTitleSection}>
              {/* Book name in italic serif (Dynamicron style) */}
              <Text style={styles.vhsBookItalic}>{bookTitle}</Text>
              {/* Chapter:verse in huge bold (T-120 style) */}
              <Text style={styles.vhsChapterBig}>{chapterVerse}</Text>
            </View>

            {/* === COLOR STRIPES === */}
            <View style={styles.vhsStripesContainer}>
              {stripeColors.map((color, i) => (
                <View
                  key={i}
                  style={[styles.vhsStripe, { backgroundColor: color }]}
                />
              ))}
              {/* Dark chevron on the right */}
              <View style={styles.vhsChevron} />
            </View>

            {/* === VERSE SECTION === */}
            <View style={styles.vhsVerseSection}>
              <Text style={styles.vhsVerseText}>{verseText}</Text>
            </View>

            {/* === BOTTOM BAR === */}
            <View style={styles.vhsBottom}>
              <View style={styles.vhsBoxLabel}>
                <Text style={styles.vhsBoxText}>VHS</Text>
              </View>
              <View style={styles.vhsBottomInfo}>
                <Text style={styles.vhsBottomBold}>VIDEO CASSETTE</Text>
                <Text style={styles.vhsBottomSmall}>
                  VIDEO RECORDING AND PLAYBACK
                </Text>
                <Text style={styles.vhsBottomSmall}>Anchor Bible App</Text>
              </View>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Apple Music template
    if (isAppleMusicTemplate && appleMusicAlbumUrl) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;
      // "Song title" = reference, "Artist" = verse text
      const songTitle = reference;

      return (
        <View style={styles.amFullContainer}>
          {/* Back button floats above scroll */}
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.amBackBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>

          <ScrollView
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={styles.amScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Capturable Now Playing card */}
            <View
              ref={appleMusicCaptureRef}
              style={styles.amCard}
              collapsable={false}
            >
              {/* Background: album art stretched + dark teal overlay */}
              <Image
                source={{ uri: appleMusicAlbumUrl }}
                style={styles.amBgBlur}
                resizeMode="cover"
              />
              <View style={styles.amBgOverlay} />

              {/* Content */}
              <View style={styles.amContent}>
                {/* Pull indicator */}
                <View style={styles.amPullBar} />

                {/* Album art */}
                <View style={styles.amAlbumShadow}>
                  <Image
                    source={{ uri: appleMusicAlbumUrl }}
                    style={styles.amAlbumArt}
                    resizeMode="cover"
                  />
                </View>

                {/* Song title (reference) + full verse + star/more */}
                <View style={styles.amTitleRow}>
                  <View style={styles.amTitleInfo}>
                    <Text style={styles.amSongTitle} numberOfLines={1}>
                      {songTitle}
                    </Text>
                    <Text style={styles.amArtistName}>{verseText}</Text>
                  </View>
                  <View style={styles.amTitleActions}>
                    <Ionicons
                      name="star-outline"
                      size={22}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={22}
                      color="rgba(255,255,255,0.8)"
                    />
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.amProgressContainer}>
                  <View style={styles.amProgressTrack}>
                    <View style={styles.amProgressFill} />
                  </View>
                  <View style={styles.amProgressTimes}>
                    <Text style={styles.amTimeText}>1:17</Text>
                    <Text style={styles.amTimeText}>-2:36</Text>
                  </View>
                </View>

                {/* Playback controls */}
                <View style={styles.amControls}>
                  <Ionicons
                    name="play-skip-back-sharp"
                    size={34}
                    color="#fff"
                  />
                  <Ionicons name="play-sharp" size={44} color="#fff" />
                  <Ionicons
                    name="play-skip-forward-sharp"
                    size={34}
                    color="#fff"
                  />
                </View>

                {/* Volume slider */}
                <View style={styles.amVolumeRow}>
                  <Ionicons
                    name="volume-low"
                    size={14}
                    color="rgba(255,255,255,0.6)"
                  />
                  <View style={styles.amVolumeTrack}>
                    <View style={styles.amVolumeFill} />
                  </View>
                  <Ionicons
                    name="volume-high"
                    size={14}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>

                {/* Bottom icons */}
                <View style={styles.amBottomRow}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                  />
                  <Ionicons
                    name="radio-outline"
                    size={22}
                    color="rgba(255,255,255,0.7)"
                  />
                  <Ionicons
                    name="list-outline"
                    size={22}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for iMessage template
    if (isIMessageTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      return (
        <View style={styles.imessageFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.imessageBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.imessageScrollContent}
            showsVerticalScrollIndicator={false}
            style={{ width: "100%" }}
          >
            {/* Capturable phone screen */}
            <View
              ref={imessageCaptureRef}
              style={styles.imessagePhone}
              collapsable={false}
            >
              {/* Status bar */}
              <View style={styles.imessageStatusBar}>
                <Text style={styles.imessageStatusTime}>9:41</Text>
                <View style={styles.imessageStatusIcons}>
                  <Ionicons name="cellular" size={12} color="#fff" />
                  <Ionicons name="wifi" size={12} color="#fff" />
                  <Ionicons name="battery-full" size={14} color="#fff" />
                </View>
              </View>

              {/* Navigation bar — matches iOS: back + avatar + bold name + video */}
              <View style={styles.imessageNavBar}>
                <View style={styles.imessageNavLeft}>
                  <Ionicons name="chevron-back" size={26} color="#0a84ff" />
                  <View style={styles.imessageAvatar}>
                    <Text style={styles.imessageAvatarText}>A</Text>
                  </View>
                </View>
                <Text style={styles.imessageContactName}>Anchor</Text>
                <View style={styles.imessageNavRight}>
                  <View style={styles.imessageVideoBtn}>
                    <Ionicons name="videocam-sharp" size={16} color="#fff" />
                  </View>
                </View>
              </View>

              {/* Message thread */}
              <View style={styles.imessageThread}>
                {/* Timestamp */}
                <Text style={styles.imessageTimestamp}>Today 9:41 AM</Text>

                {/* 1️⃣ Sent bubble FIRST — reference (book, chapter, verse) */}
                <View style={styles.imessageSentRow}>
                  <View style={styles.imessageSentBubble}>
                    <Text style={styles.imessageSentText}>{reference}</Text>
                  </View>
                </View>

                {/* Delivered under sent bubble */}
                <Text style={styles.imessageDelivered}>Delivered</Text>

                {/* 2️⃣ Received bubble — verse text reply from Anchor */}
                <View style={styles.imessageReceivedRow}>
                  <View style={styles.imessageAvatarSmall}>
                    <Text style={styles.imessageAvatarSmallText}>A</Text>
                  </View>
                  <View style={styles.imessageReceivedBubble}>
                    <Text style={styles.imessageReceivedText}>{verseText}</Text>
                  </View>
                </View>
              </View>

              {/* iMessage input bar */}
              <View style={styles.imessageInputBar}>
                <Ionicons name="add-circle" size={30} color="#0a84ff" />
                <View style={styles.imessageInputBox}>
                  <Text style={styles.imessageInputPlaceholder}>iMessage</Text>
                </View>
                <Ionicons name="mic-outline" size={22} color="#0a84ff" />
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Calculator/TI-84 Notes template
    if (isCalcTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      // Keyboard rows matching the screenshot
      const keyRows = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "⌫"],
        ["CAPS", "a", "s", "d", "f", "g", "h", "j", "k", "l", "↵", "INTR"],
        ["SHIFT", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
        [";", "'", "`", "SPACE", "[ ]"],
      ];

      return (
        <View style={styles.calcFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.calcBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View
            ref={calcCaptureRef}
            style={styles.calcDevice}
            collapsable={false}
          >
            {/* Outer device frame */}
            <View style={styles.calcFrame}>
              {/* Left toolbar */}
              <View style={styles.calcLeftBar}>
                {["✏️", "◈", "◉", "•", "⬛"].map((ic, i) => (
                  <View key={i} style={styles.calcLeftBarBtn}>
                    <Text style={styles.calcLeftBarIcon}>{ic}</Text>
                  </View>
                ))}
              </View>

              {/* Main area: screen + keyboard */}
              <View style={styles.calcMain}>
                {/* Screen */}
                <View style={styles.calcScreen}>
                  {/* Title line — reference highlighted olive/green */}
                  <View style={styles.calcTitleLine}>
                    <Text style={styles.calcTitleText} numberOfLines={1}>
                      {reference}
                    </Text>
                  </View>
                  {/* Ruled body lines with verse text */}
                  <View style={styles.calcBodyArea}>
                    <Text style={styles.calcBodyText}>{verseText}</Text>
                    {/* Ruled lines behind text */}
                    {Array(7)
                      .fill(0)
                      .map((_, i) => (
                        <View
                          key={i}
                          style={[styles.calcRuledLine, { top: i * 18 + 2 }]}
                        />
                      ))}
                  </View>
                </View>

                {/* Keyboard */}
                <View style={styles.calcKeyboard}>
                  {keyRows.map((row, ri) => (
                    <View key={ri} style={styles.calcKeyRow}>
                      {row.map((key, ki) => (
                        <View
                          key={ki}
                          style={[
                            styles.calcKey,
                            key === "CAPS" || key === "SHIFT"
                              ? styles.calcKeyWide
                              : null,
                            key === "SPACE" ? styles.calcKeySpace : null,
                            key === "INTR" || key === "↵"
                              ? styles.calcKeyMed
                              : null,
                          ]}
                        >
                          <Text style={styles.calcKeyText}>{key}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>

              {/* Right sidebar: SEND + arrow buttons */}
              <View style={styles.calcRightBar}>
                <View style={styles.calcSendBtn}>
                  <Text style={styles.calcSendText}>↑</Text>
                </View>
                <View style={[styles.calcSendBtn, styles.calcSendBtnPrimary]}>
                  <Text
                    style={[
                      styles.calcSendText,
                      { color: "#fff", fontSize: 9 },
                    ]}
                  >
                    SEND
                  </Text>
                </View>
                <View style={styles.calcSendBtn}>
                  <Text style={styles.calcSendText}>↓</Text>
                </View>
                <View style={[styles.calcSendBtn, { marginTop: 4 }]}>
                  <Text style={styles.calcSendText}>✱</Text>
                </View>
              </View>
            </View>

            {/* Close X button top-right */}
            <View style={styles.calcCloseBtn}>
              <Text style={styles.calcCloseTxt}>✕</Text>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Apple Notes template
    if (isAppleNotesTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;

      return (
        <View style={styles.appleNotesFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.appleNotesBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#f0a830" />
          </TouchableOpacity>

          {/* Capturable: the full Apple Notes-style card */}
          <View
            ref={appleNotesCaptureRef}
            style={styles.appleNotesCapture}
            collapsable={false}
          >
            {/* Top header: book left, chapter:verse right */}
            <View style={styles.appleNotesNavBar}>
              <Text style={styles.appleNotesBigTitle}>{bookTitle}</Text>
              <Text style={styles.appleNotesChapterTag}>{chapterVerse}</Text>
            </View>

            {/* Note body */}
            <View style={styles.appleNotesBody}>
              {/* Verse text body */}
              <Text style={styles.appleNotesBodyText}>{verseText}</Text>

              {/* Branding */}
              <Text style={styles.appleNotesBrandLine}>— Anchor Bible App</Text>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Mail template
    if (isMailTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      return (
        <View style={styles.mailFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.mailBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          <View
            ref={mailCaptureRef}
            style={styles.mailWindow}
            collapsable={false}
          >
            {/* Title bar */}
            <View style={styles.mailTitleBar}>
              <Text style={styles.mailTitleText}>Anchor</Text>
            </View>

            {/* Menu bar */}
            <View style={styles.mailMenuBar}>
              {["Disc", "View", "Options", "Help"].map((item) => (
                <Text key={item} style={styles.mailMenuItem}>
                  {item}
                </Text>
              ))}
            </View>

            {/* To field */}
            <View style={styles.mailFieldRow}>
              <Text style={styles.mailFieldLabel}>To:</Text>
              <View style={styles.mailFieldBox}>
                <Text style={styles.mailFieldValue}>all who seek truth</Text>
                <View style={styles.mailDropArrow}>
                  <Text style={styles.mailDropArrowText}>▼</Text>
                </View>
              </View>
            </View>

            {/* Subject field */}
            <View style={styles.mailFieldRow}>
              <Text style={styles.mailFieldLabel}>Subject:</Text>
              <View style={[styles.mailFieldBox, styles.mailSubjectBox]}>
                <Text style={styles.mailSubjectValue}>{reference}</Text>
                <View style={styles.mailDropArrow}>
                  <Text style={styles.mailDropArrowText}>▼</Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.mailDivider} />

            {/* Body */}
            <View style={styles.mailBody}>
              <Text style={styles.mailBodyText}>{verseText}</Text>
              {/* Scrollbar */}
              <View style={styles.mailScrollbar}>
                <View style={styles.mailScrollbarThumb} />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.mailButtonRow}>
              <View style={styles.mailBtn}>
                <Text style={styles.mailBtnText}>Send</Text>
              </View>
              <View style={styles.mailBtn}>
                <Text style={styles.mailBtnText}>Delete</Text>
              </View>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Progress Bar template
    if (isProgressBarTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;
      const verseNum =
        parseInt(
          chapterVerse.includes(":") ? chapterVerse.split(":")[1] : "1",
        ) || 1;
      const chapterNum =
        parseInt(
          chapterVerse.includes(":") ? chapterVerse.split(":")[0] : "1",
        ) || 1;
      // Calculate a percentage based on verse number (approximate chapter progress)
      const totalVerses = Math.max(
        verseNum + Math.floor(Math.random() * 15) + 5,
        verseNum + 10,
      );
      const percentage = Math.min(
        Math.round((verseNum / totalVerses) * 100),
        99,
      );

      return (
        <View style={styles.pbFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.pbBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.pbScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={progressBarCaptureRef}
              style={styles.pbCard}
              collapsable={false}
            >
              {/* Icon */}
              <View style={styles.pbLogoRow}>
                <AnchorLogo size={28} color="#4ade80" />
              </View>

              {/* Title row */}
              <View style={styles.pbTitleRow}>
                <Text style={styles.pbTitle}>Scripture Progress</Text>
                <View style={styles.pbBadge}>
                  <Text style={styles.pbBadgeText}>{version || "KJV"}</Text>
                </View>
              </View>

              {/* Large percentage */}
              <Text style={styles.pbPercentage}>{percentage}%</Text>

              {/* Progress bar */}
              <View style={styles.pbBarContainer}>
                <View style={styles.pbBarBackground}>
                  <View style={[styles.pbBarFill, { width: `${percentage}%` }]}>
                    <View style={styles.pbBarGlow} />
                  </View>
                </View>
                <View style={styles.pbDueContainer}>
                  <Text style={styles.pbDueText}>{reference}</Text>
                </View>
              </View>

              {/* Verse text */}
              <View style={styles.pbVerseSection}>
                <Text style={styles.pbVerseText}>"{verseText}"</Text>
              </View>

              {/* Bottom row */}
              <View style={styles.pbBottomRow}>
                <View style={styles.pbBookInfo}>
                  <Text style={styles.pbBookLabel}>{bookTitle}</Text>
                  <Text style={styles.pbChapterLabel}>
                    Chapter {chapterNum}
                  </Text>
                </View>
                <View style={styles.pbMoreBtn}>
                  <Text style={styles.pbMoreText}>Anchor Daily Verse →</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Screen Time template
    if (isScreenTimeTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;
      const chapterNum =
        parseInt(
          chapterVerse.includes(":")
            ? chapterVerse.split(":")[0]
            : chapterVerse,
        ) || 5;
      const verseNum =
        parseInt(
          chapterVerse.includes(":") ? chapterVerse.split(":")[1] : "1",
        ) || 1;
      const hours = chapterNum;
      const mins = verseNum;
      const barHeights = [0.3, 0.55, 0.65, 0.9, 0.45, 0.35, 0.2];
      const avgHeight =
        barHeights.reduce((a, b) => a + b, 0) / barHeights.length;
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return (
        <View style={styles.stFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.stBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.stScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={screenTimeCaptureRef}
              style={styles.stCard}
              collapsable={false}
            >
              {/* Nav bar */}
              <View style={styles.stNavBar}>
                <View style={styles.stNavBackRow}>
                  <Ionicons name="chevron-back" size={20} color="#007aff" />
                  <Text style={styles.stNavBack}>Settings</Text>
                </View>
                <Text style={styles.stNavTitle}>Screen Time</Text>
                <View style={{ width: 70 }} />
              </View>

              {/* Device label */}
              <View style={styles.stSectionHeader}>
                <Text style={styles.stSectionHeaderText}>ANCHOR</Text>
              </View>

              {/* Daily Average section */}
              <View style={styles.stDailySection}>
                <Text style={styles.stDailyLabel}>Daily Average</Text>
                <View style={styles.stDailyRow}>
                  <Text style={styles.stDailyTime}>
                    {hours}h {mins}m
                  </Text>
                  <Text style={styles.stDailyChange}>
                    <Ionicons name="arrow-down" size={12} color="#34c759" /> 21%
                    from last week
                  </Text>
                </View>

                {/* Bar chart */}
                <View style={styles.stChartArea}>
                  {/* Horizontal grid lines */}
                  <View style={[styles.stGridLine, { bottom: "25%" }]} />
                  <View style={[styles.stGridLine, { bottom: "50%" }]} />
                  <View style={[styles.stGridLine, { bottom: "75%" }]} />
                  {/* Y axis labels */}
                  <Text style={[styles.stYLabel, { bottom: "94%" }]}>20h</Text>
                  <Text style={[styles.stYLabel, { bottom: "-4%" }]}>0</Text>
                  {/* Average line */}
                  <View
                    style={[
                      styles.stAvgLine,
                      { bottom: `${avgHeight * 100}%` },
                    ]}
                  />
                  <Text
                    style={[
                      styles.stAvgLabel,
                      { bottom: `${avgHeight * 100}%` },
                    ]}
                  >
                    avg
                  </Text>
                  {/* Bars */}
                  <View style={styles.stBarsContainer}>
                    {barHeights.map((h, i) => (
                      <View key={i} style={styles.stBarWrapper}>
                        <View
                          style={[styles.stBar, { height: `${h * 100}%` }]}
                        />
                      </View>
                    ))}
                  </View>
                </View>

                {/* Day labels */}
                <View style={styles.stDayLabels}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <Text key={i} style={styles.stDayText}>
                      {d}
                    </Text>
                  ))}
                </View>
              </View>

              {/* See All Activity */}
              <View style={styles.stMenuRow}>
                <Text style={styles.stMenuText}>See All Activity</Text>
                <Ionicons name="chevron-forward" size={18} color="#48484a" />
              </View>

              {/* Updated */}
              <View style={styles.stSectionHeader}>
                <Text style={styles.stUpdatedText}>
                  Updated today at {timeStr}
                </Text>
              </View>

              {/* Verse text area */}
              <View style={styles.stVerseSection}>
                <Text style={styles.stVerseText}>"{verseText}"</Text>
                <Text style={styles.stVerseRef}>— {reference}</Text>
              </View>

              {/* Menu items */}
              <View style={styles.stMenuGroup}>
                <View style={styles.stMenuItem}>
                  <View
                    style={[styles.stMenuIcon, { backgroundColor: "#5856d6" }]}
                  >
                    <Ionicons name="hourglass" size={18} color="#fff" />
                  </View>
                  <View style={styles.stMenuContent}>
                    <Text style={styles.stMenuItemTitle}>Downtime</Text>
                    <Text style={styles.stMenuItemSub}>
                      Schedule time in the Word.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#48484a" />
                </View>

                <View style={styles.stMenuDivider} />

                <View style={styles.stMenuItem}>
                  <View
                    style={[styles.stMenuIcon, { backgroundColor: "#ff3b30" }]}
                  >
                    <Ionicons name="timer" size={18} color="#fff" />
                  </View>
                  <View style={styles.stMenuContent}>
                    <Text style={styles.stMenuItemTitle}>Reading Goals</Text>
                    <Text style={styles.stMenuItemSub}>
                      Set daily chapter goals.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#48484a" />
                </View>

                <View style={styles.stMenuDivider} />

                <View style={styles.stMenuItem}>
                  <View
                    style={[styles.stMenuIcon, { backgroundColor: "#34c759" }]}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  </View>
                  <View style={styles.stMenuContent}>
                    <Text style={styles.stMenuItemTitle}>Always Allowed</Text>
                    <Text style={styles.stMenuItemSub}>
                      {bookTitle} is always open.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#48484a" />
                </View>
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Notification template
    if (isNotificationTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      return (
        <View style={styles.notifFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.notifBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.notifScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={notificationCaptureRef}
              style={styles.notifCaptureArea}
              collapsable={false}
            >
              {/* The notification banner */}
              <View style={styles.notifBanner}>
                {/* Header row: icon + MESSAGES + now */}
                <View style={styles.notifHeaderRow}>
                  <View style={styles.notifAppIcon}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={16}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.notifAppName}>MESSAGES</Text>
                  <Text style={styles.notifTime}>now</Text>
                </View>

                {/* Divider */}
                <View style={styles.notifHeaderDivider} />

                {/* Body: sender + message */}
                <View style={styles.notifBodyArea}>
                  <Text style={styles.notifSender}>{reference}</Text>
                  <Text style={styles.notifMessage} numberOfLines={4}>
                    {verseText}
                  </Text>
                </View>

                {/* Grabber bar */}
                <View style={styles.notifGrabberRow}>
                  <View style={styles.notifGrabber} />
                </View>
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Tweet template
    if (isTweetTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const dateStr = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const likeCount = Math.floor(Math.random() * 900) + 100;
      const retweetCount = Math.floor(Math.random() * 300) + 50;
      const viewCount = Math.floor(Math.random() * 90) + 10 + "K";

      return (
        <View style={styles.tweetFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.tweetBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.tweetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={tweetCaptureRef}
              style={styles.tweetCard}
              collapsable={false}
            >
              {/* Tweet header */}
              <View style={styles.tweetHeader}>
                <View style={styles.tweetAvatar}>
                  <AnchorLogo size={28} color="#ffffff" />
                </View>
                <View style={styles.tweetUserInfo}>
                  <View style={styles.tweetNameRow}>
                    <Text style={styles.tweetDisplayName}>Anchor</Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#1d9bf0"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                  <Text style={styles.tweetHandle}>@anchor</Text>
                </View>
              </View>

              {/* Tweet body */}
              <Text style={styles.tweetBody}>{verseText}</Text>
              <Text style={styles.tweetReference}>{reference}</Text>

              {/* Timestamp */}
              <Text style={styles.tweetTimestamp}>
                {timeStr} · {dateStr}
              </Text>

              {/* Divider */}
              <View style={styles.tweetDivider} />

              {/* Stats row */}
              <View style={styles.tweetStatsRow}>
                <Text style={styles.tweetStat}>
                  <Text style={styles.tweetStatBold}>{retweetCount}</Text>{" "}
                  Reposts
                </Text>
                <Text style={styles.tweetStat}>
                  <Text style={styles.tweetStatBold}>{likeCount}</Text> Likes
                </Text>
                <Text style={styles.tweetStat}>
                  <Text style={styles.tweetStatBold}>{viewCount}</Text> Views
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.tweetDivider} />

              {/* Action icons */}
              <View style={styles.tweetActionsRow}>
                <Ionicons name="chatbubble-outline" size={20} color="#71767b" />
                <Ionicons name="repeat-outline" size={20} color="#71767b" />
                <Ionicons name="heart-outline" size={20} color="#71767b" />
                <Ionicons name="bookmark-outline" size={20} color="#71767b" />
                <Ionicons name="share-outline" size={20} color="#71767b" />
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Ticket Stub template
    if (isTicketStubTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse = parts[parts.length - 1] || "";
      const bookTitle = parts.slice(0, -1).join(" ") || reference;
      const chapterNum = chapterVerse.includes(":")
        ? chapterVerse.split(":")[0]
        : chapterVerse;
      const verseNum = chapterVerse.includes(":")
        ? chapterVerse.split(":")[1]
        : "1";
      const bibleVersion = version || "WEB";
      const barPattern = [
        3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 1, 1, 3, 2,
        1, 3, 1, 2, 1, 2, 3, 1, 2, 1,
      ];

      return (
        <View style={styles.ticketStubFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.ticketStubBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.ticketStubScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={ticketStubCaptureRef}
              style={styles.ticketStubCard}
              collapsable={false}
            >
              {/* Top bar */}
              <View style={styles.ticketStubTopBar}>
                <View style={styles.ticketStubTopBarRow}>
                  <Text style={styles.ticketStubTopBarText}>ANCHOR </Text>
                  <AnchorLogo size={14} color="#000000" />
                  <Text style={styles.ticketStubTopBarText}> DAILY VERSE</Text>
                </View>
              </View>

              {/* Image area */}
              <View style={styles.ticketStubImageArea}>
                {ticketStubPhotoUrl ? (
                  <Image
                    source={{ uri: ticketStubPhotoUrl }}
                    style={styles.ticketStubImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.ticketStubImagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#333" />
                  </View>
                )}
              </View>

              {/* Verse text below image */}
              <View style={styles.ticketStubVerseArea}>
                <Text style={styles.ticketStubVerseText}>"{verseText}"</Text>
                <Text style={styles.ticketStubReference}>— {reference}</Text>
              </View>

              {/* ── Horizontal perforation ── */}
              <View style={styles.ticketStubPerforation}>
                <View style={styles.ticketStubPerfNotchLeft} />
                {Array.from({ length: 28 }).map((_, i) => (
                  <View key={i} style={styles.ticketStubPerfDot} />
                ))}
                <View style={styles.ticketStubPerfNotchRight} />
              </View>

              {/* ── Tear-off stub (bottom) ── */}
              <View style={styles.ticketStubTearOff}>
                <View style={styles.ticketStubTearRow}>
                  <View style={styles.ticketStubTearInfoItem}>
                    <Text style={styles.ticketStubTearLabel}>VERSION</Text>
                    <Text style={styles.ticketStubTearValue}>
                      {bibleVersion}
                    </Text>
                  </View>
                  <View style={styles.ticketStubTearInfoItem}>
                    <Text style={styles.ticketStubTearLabel}>BOOK</Text>
                    <Text style={styles.ticketStubTearValue}>
                      {bookTitle.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.ticketStubTearInfoItem}>
                    <Text style={styles.ticketStubTearLabel}>CHAPTER</Text>
                    <Text style={styles.ticketStubTearValue}>{chapterNum}</Text>
                  </View>
                  <View style={styles.ticketStubTearInfoItem}>
                    <Text style={styles.ticketStubTearLabel}>VERSE</Text>
                    <Text style={styles.ticketStubTearValue}>{verseNum}</Text>
                  </View>
                </View>
                {/* Barcode */}
                <View style={styles.ticketStubBarcodeRow}>
                  {barPattern.map((w, i) =>
                    i % 2 === 0 ? (
                      <View
                        key={i}
                        style={[styles.ticketStubBar, { width: w * 1.8 }]}
                      />
                    ) : (
                      <View key={i} style={{ width: w * 1.2 }} />
                    ),
                  )}
                </View>
                <Text style={styles.ticketStubTearAdmit}>ADMIT ONE</Text>
              </View>
            </View>

            {renderTemplateActionBar()}
          </ScrollView>
        </View>
      );
    }

    // Special rendering for Nokia template
    if (isNokiaTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";

      return (
        <View style={styles.nokiaFullContainer}>
          {/* Back button */}
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.nokiaBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          {/* Capturable Nokia phone */}
          <View
            ref={nokiaCaptureRef}
            style={styles.nokiaBody}
            collapsable={false}
          >
            {/* Top speaker dots */}
            <View style={styles.nokiaSpeakerDots}>
              <View style={styles.nokiaDot} />
              <View style={styles.nokiaDot} />
              <View style={styles.nokiaDot} />
              <View style={styles.nokiaDot} />
            </View>

            {/* Screen */}
            <View style={styles.nokiaScreenBezel}>
              <View style={styles.nokiaScreen}>
                {/* Status bar: signal + battery */}
                <View style={styles.nokiaStatusBar}>
                  <Text style={styles.nokiaSignal}>▂▄▆█</Text>
                  <View style={styles.nokiaBatteryOuter}>
                    <View style={styles.nokiaBatteryFill} />
                  </View>
                </View>

                {/* Verse reference as title */}
                <Text style={styles.nokiaVerseRef}>{reference}</Text>

                {/* Thin separator */}
                <View style={styles.nokiaSeparator} />

                {/* Verse text in pixel style */}
                <Text style={styles.nokiaVerseText}>{verseText}</Text>

                {/* Bottom: "Anchor" branding */}
                <Text style={styles.nokiaBrand}>— Anchor Bible</Text>
              </View>
            </View>

            {/* Navigation buttons row */}
            <View style={styles.nokiaNavRow}>
              <View style={styles.nokiaNavSide} />
              <View style={styles.nokiaNavCenter} />
              <View style={styles.nokiaNavSide} />
            </View>

            {/* Keypad rows */}
            {[
              ["1", "2 ABC", "3 DEF"],
              ["4 GHI", "5 JKL", "6 MNO"],
              ["7 PQRS", "8 TUV", "9 WXYZ"],
              ["* +", "0", "# ◻"],
            ].map((row, ri) => (
              <View key={ri} style={styles.nokiaKeyRow}>
                {row.map((label, ki) => (
                  <View key={ki} style={styles.nokiaKey}>
                    <Text style={styles.nokiaKeyText}>{label}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Nokia wordmark */}
            <Text style={styles.nokiaWordmark}>NOKIA</Text>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for iPod template
    if (isIpodTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      // Parse "Book Chapter:Verse" for the list
      const refParts = reference.split(" ");
      const bookName = refParts.slice(0, -1).join(" ") || reference;
      const chapterVerse = refParts[refParts.length - 1] || "";

      // Fake nearby list items for authenticity
      const listItems = [
        { label: "Songs", sub: "" },
        { label: "Playlists", sub: "" },
        { label: bookName, sub: chapterVerse, selected: true },
        { label: "Settings", sub: "" },
        { label: "Shuffle Songs", sub: "" },
      ];

      return (
        <View style={styles.ipodFullContainer}>
          {/* Back button */}
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.ipodBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          {/* Capturable iPod card */}
          <View
            ref={ipodCaptureRef}
            style={styles.ipodBody}
            collapsable={false}
          >
            {/* Screen with dark bezel */}
            <View style={styles.ipodScreenBezel}>
              <View style={styles.ipodScreen}>
                {/* Screen top bar — thin strip: "Anchor" left, play+battery right */}
                <View style={styles.ipodScreenTopBar}>
                  <Text style={styles.ipodAnchorLabel}>Anchor</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons name="play" size={9} color="#3a3a3a" />
                    <View style={styles.ipodBatteryOuter}>
                      <View style={styles.ipodBatteryFill} />
                    </View>
                  </View>
                </View>

                {/* Content area: left list + right verse */}
                <View style={styles.ipodContentArea}>
                  {/* Left menu list */}
                  <View style={styles.ipodMenuList}>
                    {listItems.map((item, i) => (
                      <View
                        key={i}
                        style={[
                          styles.ipodMenuItem,
                          item.selected && styles.ipodMenuItemSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.ipodMenuItemText,
                            item.selected && styles.ipodMenuItemTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                        {item.selected && (
                          <Text style={styles.ipodMenuItemArrow}>›</Text>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Vertical divider */}
                  <View style={styles.ipodDivider} />

                  {/* Right verse panel */}
                  <View style={styles.ipodVersePanel}>
                    <Text style={styles.ipodVerseRef}>{reference}</Text>
                    <Text style={styles.ipodVerseText}>{verseText}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Click wheel */}
            <View style={styles.ipodWheelContainer}>
              {/* Outer ring */}
              <View style={styles.ipodWheelOuter}>
                {/* MENU top */}
                <Text style={styles.ipodWheelMenu}>MENU</Text>
                {/* |<< left */}
                <Text style={styles.ipodWheelBack}>{"|◀◀"}</Text>
                {/* ▶▶| right */}
                <Text style={styles.ipodWheelFwd}>{"▶▶|"}</Text>
                {/* ▶II bottom */}
                <Text style={styles.ipodWheelPlay}>{"▶ II"}</Text>
                {/* Center button */}
                <View style={styles.ipodWheelCenter} />
              </View>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Anchor Search template
    if (isSearchTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      // Split reference into suggestion "results"
      const words = verseText.split(" ");
      const snippet1 =
        words.slice(0, Math.ceil(words.length / 2)).join(" ") + "...";
      const snippet2 = words.slice(Math.ceil(words.length / 2)).join(" ");

      return (
        <View style={styles.searchFullContainer}>
          {/* Back button */}
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.searchBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#555" />
          </TouchableOpacity>

          {/* Capturable search card */}
          <View
            ref={searchCaptureRef}
            style={styles.searchCard}
            collapsable={false}
          >
            {/* Top bar area */}
            <View style={styles.searchHeader}>
              {/* Anchor logo in Google colors */}
              <Text style={styles.searchLogoText}>
                <Text style={{ color: "#4285F4" }}>A</Text>
                <Text style={{ color: "#EA4335" }}>n</Text>
                <Text style={{ color: "#FBBC05" }}>c</Text>
                <Text style={{ color: "#4285F4" }}>h</Text>
                <Text style={{ color: "#34A853" }}>o</Text>
                <Text style={{ color: "#EA4335" }}>r</Text>
              </Text>
            </View>

            {/* Search bar with verse reference */}
            <View style={styles.searchBarContainer}>
              <Ionicons
                name="search"
                size={18}
                color="#9aa0a6"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.searchBarText} numberOfLines={1}>
                {reference}
              </Text>
              <Ionicons
                name="mic-outline"
                size={20}
                color="#4285F4"
                style={{ marginLeft: 8 }}
              />
            </View>

            {/* Divider */}
            <View style={styles.searchDivider} />

            {/* Search results / suggestions area */}
            <View style={styles.searchResults}>
              <View style={styles.searchResultItem}>
                <Ionicons
                  name="search"
                  size={14}
                  color="#9aa0a6"
                  style={styles.searchResultIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultTitle} numberOfLines={2}>
                    {reference} — {snippet1}
                  </Text>
                  <Text style={styles.searchResultUrl}>
                    anchor-bible.app › verses
                  </Text>
                </View>
              </View>
              <View style={styles.searchResultItem}>
                <Ionicons
                  name="search"
                  size={14}
                  color="#9aa0a6"
                  style={styles.searchResultIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchResultTitle} numberOfLines={2}>
                    {snippet2}
                  </Text>
                  <Text style={styles.searchResultUrl}>
                    anchor-bible.app › scripture
                  </Text>
                </View>
              </View>
              {/* Full verse block */}
              <View style={styles.searchVerseBlock}>
                <Text style={styles.searchVerseBlockTitle}>{reference}</Text>
                <Text style={styles.searchVerseBlockText}>{verseText}</Text>
                <Text style={styles.searchVerseBlockSource}>
                  Anchor Bible App
                </Text>
              </View>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Special rendering for Polaroid frame templates - FULL SCREEN
    // Show if it's a frame template OR if polaroidFrameUrl is set
    if (
      (selectedPreset?.is_frame_template || polaroidFrameUrl) &&
      selectedImageUrl
    ) {
      return (
        <View style={styles.polaroidFullScreenContainer}>
          {/* Back button - floating above capture area */}
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.polaroidBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>

          {/* Capturable Polaroid card - this entire View is captured as the shared image */}
          <View
            ref={polaroidCaptureRef}
            style={styles.polaroidFullCard}
            collapsable={false}
          >
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.polaroidFullImage}
              resizeMode="cover"
            />

            {/* White bottom area with text */}
            <View style={styles.polaroidFullBottomArea}>
              <Text style={styles.polaroidDate}>
                {new Date().toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })}
              </Text>
              <Text
                style={[
                  styles.polaroidText,
                  selectedPreset?.font_family && {
                    fontFamily: selectedPreset.font_family,
                  },
                  selectedPreset?.text_color && {
                    color: selectedPreset.text_color,
                  },
                ]}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {cleanVerseText(verse?.text || "")}
              </Text>
              <Text style={styles.polaroidReference}>
                {verse?.reference || ""}
              </Text>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Warning sign template
    if (isWarningTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse =
        parts.length > 1 ? parts[parts.length - 1] : reference;
      const bookTitle = parts
        .slice(0, parts.length - 1)
        .join(" ")
        .toUpperCase();

      return (
        <View style={styles.warnFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.warnBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View
            ref={warningCaptureRef}
            style={styles.warnSign}
            collapsable={false}
          >
            {/* Black header band */}
            <View style={styles.warnBand}>
              <AnchorLogo size={36} color="#fff" />
              <View style={styles.warnBandTextCol}>
                <Text style={styles.warnBookTitle}>{bookTitle}</Text>
                <Text style={styles.warnChapterVerse}>{chapterVerse}</Text>
              </View>
            </View>

            {/* White body */}
            <View style={styles.warnBody}>
              {/* Verse text as warning description */}
              <Text style={styles.warnVerseText}>
                {verseText.toUpperCase()}
              </Text>

              <View style={styles.warnBodyDivider} />

              {/* Red bottom warning line */}
              <Text style={styles.warnRedLine}>
                DO NOT IGNORE THIS WARNING — IT IS THE WORD OF GOD.
              </Text>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Revival poster template
    if (isRevivalTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse =
        parts.length > 1 ? parts[parts.length - 1] : reference;
      const bookTitle = parts
        .slice(0, parts.length - 1)
        .join(" ")
        .toUpperCase();

      return (
        <View style={styles.revFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.revBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>

          <View
            ref={revivalCaptureRef}
            style={styles.revCard}
            collapsable={false}
          >
            {/* Large title */}
            <View style={styles.revTitleRow}>
              <Text style={styles.revTitle}>{bookTitle}</Text>
            </View>

            <View style={styles.revHRule} />

            {/* Middle info grid */}
            <View style={styles.revInfoRow}>
              <View style={styles.revInfoLeft}>
                <Text style={styles.revInfoTop}>THE HOLY BIBLE</Text>
                <Text style={styles.revInfoBottom}>{reference}</Text>
              </View>
              <View style={styles.revInfoVRule} />
              <View style={styles.revInfoRight}>
                <Text style={styles.revFeatLabel}>CHAPTER & VERSE</Text>
                <Text style={styles.revFeatName}>{chapterVerse}</Text>
              </View>
            </View>

            <View style={styles.revHRule} />

            {/* Color bar row */}
            <View style={styles.revColorBarRow}>
              <View
                style={[
                  styles.revColorSeg,
                  { backgroundColor: "#2b2b2b", flex: 2 },
                ]}
              />
              <View
                style={[
                  styles.revColorSeg,
                  { backgroundColor: "#7B4F2E", flex: 1.5 },
                ]}
              />
              <View
                style={[
                  styles.revColorSeg,
                  { backgroundColor: "#C8862A", flex: 1 },
                ]}
              />
              <View
                style={[
                  styles.revColorSeg,
                  { backgroundColor: "#D4C5A9", flex: 1.5 },
                ]}
              />
              <View
                style={[
                  styles.revColorSeg,
                  { backgroundColor: "#8B9EB0", flex: 2 },
                ]}
              />
            </View>

            <View style={styles.revHRule} />

            {/* Bottom row: verse text + accent + icons */}
            <View style={styles.revBottomRow}>
              <View style={styles.revVerseBox}>
                <Text style={styles.revVerseText}>{verseText}</Text>
              </View>
              <View style={styles.revAccentBox} />
              <View style={styles.revIconBox}>
                <AnchorLogo size={20} color="#111" />
              </View>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // App Store listing template
    if (isAppStoreTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse =
        parts.length > 1 ? parts[parts.length - 1] : reference;
      const bookTitle = parts.slice(0, parts.length - 1).join(" ");
      const today = new Date();
      const daysAgo = Math.floor(Math.random() * 6) + 1;
      const dateLabel = `${daysAgo}d ago`;

      return (
        <View style={styles.asFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.asBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <View
            ref={appStoreCaptureRef}
            style={styles.asCard}
            collapsable={false}
          >
            {/* Header row */}
            <View style={styles.asHeaderRow}>
              <View style={styles.asAppIcon}>
                <AnchorLogo size={36} color="#fff" />
              </View>
              <View style={styles.asAppInfo}>
                <Text style={styles.asAppName} numberOfLines={1}>
                  {bookTitle} {chapterVerse}
                </Text>
                <Text style={styles.asAppDev}>Anchor Bible App</Text>
                <View style={styles.asDownloadRow}>
                  <Ionicons
                    name="cloud-download-outline"
                    size={22}
                    color="#0A84FF"
                  />
                </View>
              </View>
            </View>

            {/* TestFlight-style banner */}
            <View style={styles.asBanner}>
              <Text style={styles.asBannerText}>{reference} is installed.</Text>
              <Text style={styles.asBannerLink}>View in Anchor Bible App</Text>
            </View>

            {/* Info row */}
            <View style={styles.asInfoRow}>
              <View style={styles.asInfoCell}>
                <Text style={styles.asInfoLabel}>VERSE</Text>
                <Text style={styles.asInfoValue}>{chapterVerse}</Text>
                <Text style={styles.asInfoSub}>Reference</Text>
              </View>
              <View style={styles.asInfoDivider} />
              <View style={styles.asInfoCell}>
                <Text style={styles.asInfoLabel}>CATEGORY</Text>
                <Ionicons name="book-outline" size={16} color="#aaa" />
                <Text style={styles.asInfoSub}>Scripture</Text>
              </View>
              <View style={styles.asInfoDivider} />
              <View style={styles.asInfoCell}>
                <Text style={styles.asInfoLabel}>DEVELOPER</Text>
                <Ionicons name="person-outline" size={16} color="#aaa" />
                <Text style={styles.asInfoSub}>Anchor</Text>
              </View>
            </View>

            <View style={styles.asSectionDivider} />

            {/* What's New */}
            <View style={styles.asWhatsNewRow}>
              <Text style={styles.asWhatsNewTitle}>What's New</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
            <View style={styles.asVersionRow}>
              <Text style={styles.asVersionText}>Version 1.0.0</Text>
              <Text style={styles.asDateText}>{dateLabel}</Text>
            </View>
            <Text style={styles.asVerseText}>{verseText}</Text>

            <View style={styles.asSectionDivider} />

            <Text style={styles.asFooter}>Anchor Bible App · Scripture</Text>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Monopoly Title Deed template
    if (isMonopolyTemplate) {
      const verseText = cleanVerseText(verse?.text || "");
      const reference = verse?.reference || "";
      const parts = reference.split(" ");
      const chapterVerse =
        parts.length > 1 ? parts[parts.length - 1] : reference;
      const bookTitle = parts
        .slice(0, parts.length - 1)
        .join(" ")
        .toUpperCase();

      return (
        <View style={styles.monoFullContainer}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.monoBackButton}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <View
            ref={monopolyCaptureRef}
            style={styles.monoOuterFrame}
            collapsable={false}
          >
            {/* Inner matting border */}
            <View style={styles.monoInnerMat}>
              {/* Colored header band */}
              <View style={styles.monoColorBand}>
                <Text style={styles.monoPropertyName}>{bookTitle}</Text>
                <Text style={styles.monoChapterVerse}>{chapterVerse}</Text>
              </View>

              {/* White card body */}
              <View style={styles.monoCardBody}>
                <Text style={styles.monoVerseText}>{verseText}</Text>

                <View style={styles.monoDivider} />

                <Text style={styles.monoDisclaimer}>
                  {
                    "If a reader finds ALL the verses of any\nBook, their faith is doubled in that group."
                  }
                </Text>
                <Text style={styles.monoCopyright}>Anchor Bible App</Text>
              </View>
            </View>
          </View>

          {renderTemplateActionBar()}
        </View>
      );
    }

    // Regular preview for non-Polaroid presets
    return (
      <View style={styles.previewView}>
        <View style={styles.previewHeader}>
          <TouchableOpacity
            onPress={handleCancelPreview}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Customize</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preview Card */}
        <View style={styles.previewContainer}>
          <View style={styles.previewCard}>
            {/* Floating Close Button - On Image Corner */}
            <TouchableOpacity
              onPress={handleCancelPreview}
              style={styles.floatingCloseButton}
            >
              <Ionicons name="close-circle" size={44} color="#ffffff" />
            </TouchableOpacity>

            <View
              ref={cameraRollCaptureRef}
              collapsable={false}
              style={{ flex: 1 }}
            >
              {selectedImageUrl ? (
                <>
                  <Image
                    source={{ uri: selectedImageUrl }}
                    style={styles.previewImage}
                    resizeMode="cover"
                    onLoad={() => {
                      console.log("✅ Preview image loaded");
                      setImageLoaded(true);
                    }}
                    onError={(error) => {
                      console.error("❌ Preview image failed to load:", error);
                      setImageLoaded(false);
                    }}
                  />
                  {overlayEnabled && <View style={styles.darkOverlay} />}
                  <Animated.View
                    style={[
                      styles.textContainer,
                      {
                        transform: [
                          { translateX: pan.x },
                          { translateY: pan.y },
                          { scale: textScale },
                        ],
                      },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    {renderStrokedText(
                      `"${cleanVerseText(verse?.text || "")}"`,
                      styles.previewVerseText,
                    )}
                    {renderStrokedText(
                      verse?.reference || "Reference",
                      styles.previewReference,
                    )}
                  </Animated.View>
                </>
              ) : (
                <View style={styles.previewBlack}>
                  <Animated.View
                    style={[
                      styles.textContainer,
                      {
                        transform: [
                          { translateX: pan.x },
                          { translateY: pan.y },
                          { scale: textScale },
                        ],
                      },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    {renderStrokedText(
                      `"${cleanVerseText(verse?.text || "")}"`,
                      styles.previewVerseText,
                    )}
                    {renderStrokedText(
                      verse?.reference || "Reference",
                      styles.previewReference,
                    )}
                  </Animated.View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Compact Controls */}
        <View style={styles.compactControls}>
          {/* Font chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {FONT_OPTIONS.map((font) => (
                <TouchableOpacity
                  key={font.label}
                  style={[
                    styles.fontChip,
                    selectedFont === font.value && styles.fontChipActive,
                  ]}
                  onPress={() => setSelectedFont(font.value)}
                >
                  <Text
                    style={[
                      styles.fontChipText,
                      { fontFamily: font.value ?? undefined },
                      selectedFont === font.value && styles.fontChipTextActive,
                    ]}
                  >
                    {font.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Inline toggles row */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={styles.sizeBtn}
              onPress={() => adjustTextSize("down")}
            >
              <Ionicons name="remove" size={18} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.sizeValue}>{Math.round(textScale * 100)}%</Text>
            <TouchableOpacity
              style={styles.sizeBtn}
              onPress={() => adjustTextSize("up")}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.toggleDivider} />

            <TouchableOpacity
              style={[
                styles.inlineToggle,
                strokeEnabled && styles.inlineToggleActive,
              ]}
              onPress={() => setStrokeEnabled(!strokeEnabled)}
            >
              <Text
                style={[
                  styles.inlineToggleText,
                  strokeEnabled && styles.inlineToggleTextActive,
                ]}
              >
                Stroke
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.inlineToggle,
                overlayEnabled && styles.inlineToggleActive,
              ]}
              onPress={() => setOverlayEnabled(!overlayEnabled)}
            >
              <Text
                style={[
                  styles.inlineToggleText,
                  overlayEnabled && styles.inlineToggleTextActive,
                ]}
              >
                Overlay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionIcon, isSharing && styles.actionIconDisabled]}
            onPress={handleConfirmSave}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={26} color="#ffffff" />
                <Text style={styles.actionIconLabel}>Save</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIcon, isSharing && styles.actionIconDisabled]}
            onPress={handleConfirmShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="share-outline" size={26} color="#ffffff" />
                <Text style={styles.actionIconLabel}>Share</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedImageUrl
            ? renderPreview()
            : showPresets
              ? renderPresets()
              : renderMainOptions()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000",
  },
  modalContent: {
    backgroundColor: "#000000",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 0,
    flex: 1,
  },
  optionsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  cancelButton: {
    marginTop: 8,
    padding: 18,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  presetsView: {
    flex: 1,
  },
  presetsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  backButton: {
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  presetsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  presetsScroll: {
    flex: 1,
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },
  presetCard: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#2a2a2a",
  },
  presetImage: {
    width: "100%",
    height: "100%",
  },
  frameTemplateLabel: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  frameTemplateLabelText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  // Polaroid designed thumbnail
  polaroidThumbOuter: {
    flex: 1,
    backgroundColor: "#f5f0e8",
    borderRadius: 4,
    padding: 5,
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  polaroidThumbPhoto: {
    flex: 1,
    backgroundColor: "#b8c8d8",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 0,
  },
  polaroidThumbPhotoOverlay: {
    flex: 1,
    backgroundColor: "rgba(80,100,120,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  polaroidThumbBottom: {
    paddingTop: 5,
    paddingBottom: 6,
    paddingHorizontal: 2,
    gap: 3,
  },
  polaroidThumbDateLine: {
    height: 3,
    width: "45%",
    backgroundColor: "#c8b89a",
    borderRadius: 2,
  },
  polaroidThumbTextLine: {
    height: 3,
    width: "75%",
    backgroundColor: "#d8c8aa",
    borderRadius: 2,
  },
  polaroidThumbBadge: {
    position: "absolute",
    bottom: 32,
    right: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  polaroidThumbBadgeText: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    width: "100%",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  previewView: {
    flex: 1,
  },
  floatingCloseButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 22,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
    backgroundColor: "#000000",
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewCard: {
    width: "100%",
    aspectRatio: 9 / 16, // 9:16 vertical format for Instagram Stories/Reels
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#2a2a2a",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  darkOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  textContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  previewOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  previewBlack: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  previewVerseText: {
    fontSize: 20,
    fontWeight: "300",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 16,
  },
  previewReference: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  compactControls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#2a2a2a",
    marginHorizontal: 4,
  },
  inlineToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  inlineToggleActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  inlineToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
  },
  inlineToggleTextActive: {
    color: "#000000",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    gap: 40,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    marginTop: 8,
  },
  actionIcon: {
    alignItems: "center",
    gap: 4,
  },
  actionIconDisabled: {
    opacity: 0.4,
  },
  actionIconLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  hintText: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  controlSection: {
    gap: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  sizeButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeBtnText: {
    color: "#ffffff",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "300",
  },
  sizeValue: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 44,
    textAlign: "center",
  },
  fontChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  fontChipActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  fontChipText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  fontChipTextActive: {
    color: "#000000",
    fontWeight: "700",
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2a2a2a",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#3b82f6",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#6b7280",
  },
  toggleThumbActive: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-end",
  },
  // Polaroid FULL SCREEN styles
  polaroidFullScreenContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  polaroidBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    elevation: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  polaroidFullCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    margin: 0,
    padding: 20,
    marginBottom: 80,
  },
  polaroidFullImage: {
    width: "100%",
    flex: 1,
  },
  polaroidFullBottomArea: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  polaroidFullActions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
    zIndex: 100,
    elevation: 100,
  },
  polaroidDate: {
    fontFamily: "Caveat",
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  polaroidText: {
    fontFamily: "Caveat",
    fontSize: 22,
    color: "#2c3e50",
    lineHeight: 30,
  },
  polaroidReference: {
    fontFamily: "Caveat",
    fontSize: 20,
    color: "#666",
    marginTop: 10,
    fontWeight: "600",
  },
  frameOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  polaroidTextPosition: {
    bottom: "15%",
  },
  // HTML preset thumbnail styles
  htmlPresetThumbnail: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    borderRadius: 8,
    padding: 6,
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: 4,
  },
  htmlThumbGlowBtn: {
    backgroundColor: "#00e5ff",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#00e5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  htmlThumbBtnText: {
    fontSize: 8,
    color: "#0a0a0a",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  htmlThumbCodeBlock: {
    width: "100%",
    backgroundColor: "#1e1e1e",
    borderRadius: 4,
    padding: 4,
  },
  htmlThumbDots: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 3,
  },
  htmlThumbDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  htmlThumbCode: {
    fontSize: 6,
    color: "#00e5ff",
    fontFamily: "monospace",
  },
  htmlPresetLabel: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,229,255,0.2)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  htmlPresetLabelText: {
    fontSize: 9,
    color: "#00e5ff",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  // HTML full preview styles
  htmlFullContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  htmlBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,229,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  htmlScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },
  htmlCard: {
    width: "100%",
    backgroundColor: "#0a0a0a",
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 16,
  },
  // Glowing button
  htmlGlowWrapper: {
    alignItems: "center",
    paddingVertical: 12,
  },
  htmlGlowButton: {
    backgroundColor: "#00e5ff",
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: "#00e5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  htmlGlowButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a0a0a",
    fontFamily: "monospace",
    textAlign: "center",
  },
  // Code block
  htmlCodeBlock: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  htmlTrafficLights: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 10,
  },
  htmlDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  htmlCodeLine: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "monospace",
  },
  htmlSelector: {
    color: "#c792ea",
  },
  htmlBrace: {
    color: "#ffffff",
  },
  htmlProp: {
    color: "#82aaff",
  },
  htmlValue: {
    color: "#c3e88d",
  },
  htmlCyan: {
    color: "#00e5ff",
  },
  htmlPunct: {
    color: "#ffffff",
  },
  htmlTag: {
    color: "#f07178",
  },
  htmlTagContent: {
    color: "#c3e88d",
  },
  htmlActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // Windows 95 preset thumbnail styles
  win95PresetThumbnail: {
    flex: 1,
    backgroundColor: "#008080",
    borderRadius: 8,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  win95ThumbDesktop: {
    width: "90%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  win95ThumbDialog: {
    width: "85%",
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  win95ThumbTitleBar: {
    backgroundColor: "#000080",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  win95ThumbTitleText: {
    fontSize: 6,
    color: "#ffffff",
    fontWeight: "700",
  },
  win95ThumbX: {
    fontSize: 6,
    color: "#ffffff",
  },
  win95ThumbBody: {
    padding: 4,
    gap: 2,
  },
  win95ThumbLine: {
    height: 3,
    backgroundColor: "#444",
    borderRadius: 1,
    width: "100%",
  },
  win95PresetLabel: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  win95PresetLabelText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700",
  },
  // Windows 95 full preview styles
  win95FullContainer: {
    flex: 1,
    backgroundColor: "#008080",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  win95BackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,128,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  win95Card: {
    width: "100%",
    aspectRatio: 4 / 5,
    position: "relative",
    overflow: "hidden",
    borderRadius: 4,
  },
  win95BgPhoto: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  // The floating dialog box
  win95Dialog: {
    position: "absolute",
    top: "18%",
    left: "8%",
    right: "8%",
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 6,
  },
  // Blue gradient title bar
  win95TitleBar: {
    backgroundColor: "#000080",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  win95TitleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "monospace",
    flex: 1,
  },
  win95TitleButtons: {
    flexDirection: "row",
    gap: 2,
  },
  win95TitleBtn: {
    width: 16,
    height: 14,
    backgroundColor: "#c0c0c0",
    borderWidth: 1.5,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    justifyContent: "center",
    alignItems: "center",
  },
  win95CloseBtnBg: {
    backgroundColor: "#c0c0c0",
  },
  win95TitleBtnText: {
    fontSize: 8,
    color: "#000000",
    fontWeight: "700",
    lineHeight: 10,
  },
  // Dialog interior
  win95DialogBody: {
    padding: 12,
  },
  win95ContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  win95IconWrap: {
    marginRight: 12,
    marginTop: 2,
  },
  win95IconOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  win95IconImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  win95VerseText: {
    flex: 1,
    fontSize: 12,
    color: "#000000",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  win95BodySeparator: {
    height: 1,
    backgroundColor: "#808080",
    marginBottom: 10,
  },
  win95ButtonRow: {
    alignItems: "center",
  },
  win95OkButton: {
    backgroundColor: "#c0c0c0",
    borderWidth: 1.5,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    paddingHorizontal: 28,
    paddingVertical: 5,
    minWidth: 72,
    alignItems: "center",
  },
  win95OkText: {
    fontSize: 12,
    color: "#000000",
    fontFamily: "monospace",
    fontWeight: "600",
  },
  win95Actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // ─── Retro Game preset ───────────────────────────────────────────────────
  // Thumbnail
  retroThumb: {
    flex: 1,
    backgroundColor: "#0a0f0a",
    borderRadius: 6,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 6,
    paddingHorizontal: 4,
    gap: 3,
  },
  retroThumbSun: {
    width: 22,
    height: 11,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    backgroundColor: "#cc0000",
    marginBottom: 2,
  },
  retroThumbTitle: {
    fontSize: 6,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.5,
    fontFamily: "monospace",
  },
  retroThumbMenu: {
    width: "100%",
    paddingHorizontal: 4,
    gap: 1,
  },
  retroThumbMenuItem: {
    fontSize: 5,
    color: "#ffffff",
    fontFamily: "monospace",
    letterSpacing: 0.3,
  },
  retroThumbLabel: {
    backgroundColor: "#cc0000",
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: "center",
  },
  retroThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  // Full preview
  retroFullContainer: {
    flex: 1,
    backgroundColor: "#05080a",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  retroBackBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  // The capturable card — deep dark blue-gray like a real CRT
  retroCard: {
    width: SCREEN_WIDTH - 32,
    aspectRatio: 9 / 14,
    backgroundColor: "#0a0f0a",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00ff44",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#1a2a1a",
  },
  // CRT scanlines
  retroScanlines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  retroScanline: {
    height: 3,
    width: "100%",
    backgroundColor: "#000",
  },
  // CRT vignette — darkened edges
  retroVignette: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    // Simulate vignette with a semi-transparent dark border-glow
    borderWidth: 28,
    borderColor: "rgba(0,0,0,0.55)",
  },
  // Red sun half-circle
  retroSunContainer: {
    position: "absolute",
    top: "8%",
    alignItems: "center",
    width: "100%",
    zIndex: 1,
  },
  retroSun: {
    width: 80,
    height: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: "#cc0000",
  },
  // Title — reference
  retroTitleContainer: {
    position: "absolute",
    top: "28%",
    alignItems: "center",
    width: "100%",
    zIndex: 2,
  },
  retroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#e8ffe8",
    letterSpacing: 3,
    fontFamily: "monospace",
    textAlign: "center",
    textShadowColor: "rgba(100,255,100,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  retroTitleGlitch: {
    position: "absolute",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
    fontFamily: "monospace",
    textAlign: "center",
    color: "#ffffff",
  },
  retroGlitchRed: {
    color: "#ffffff",
  },
  retroGlitchBlue: {
    color: "#ffffff",
  },
  retroTitleUnderline: {
    height: 2,
    width: "75%",
    backgroundColor: "#e8ffe8",
    marginTop: 4,
    shadowColor: "rgba(100,255,100,0.8)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
  // Menu items — verse lines, positioned lower to fit all content
  retroMenuContainer: {
    position: "absolute",
    top: "52%",
    left: "8%",
    right: "8%",
    zIndex: 2,
    gap: 6,
  },
  retroMenuItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  retroMenuArrow: {
    fontSize: 11,
    color: "#e8ffe8",
    fontFamily: "monospace",
    textShadowColor: "rgba(100,255,100,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  retroMenuText: {
    fontSize: 11,
    color: "#e8ffe8",
    fontFamily: "monospace",
    letterSpacing: 1.5,
    flexShrink: 1,
    textShadowColor: "rgba(100,255,100,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  retroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // ─── VHS preset ──────────────────────────────────────────────────────────
  // Thumbnail
  vhsThumb: {
    flex: 1,
    backgroundColor: "#f0ede0",
    borderRadius: 6,
    overflow: "hidden",
    padding: 5,
    gap: 1,
  },
  vhsThumbLogo: {
    fontSize: 9,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  vhsThumbItalic: {
    fontSize: 7,
    fontStyle: "italic",
    color: "#222",
    fontWeight: "600",
  },
  vhsThumbBig: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  vhsThumbStripes: {
    flex: 1,
    overflow: "hidden",
  },
  vhsThumbStripe: {
    height: 5,
    width: "100%",
  },
  vhsThumbLabel: {
    backgroundColor: "#111",
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: "center",
  },
  vhsThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 1,
  },
  // Full preview
  vhsFullContainer: {
    flex: 1,
    backgroundColor: "#e8e4d4",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  vhsBackBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  // The capturable VHS label card — portrait like a real VHS sleeve
  vhsCard: {
    width: SCREEN_WIDTH - 32,
    aspectRatio: 9 / 16,
    backgroundColor: "#f0ede0",
    borderRadius: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // Top area: ANCHOR + dot grid
  vhsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 4,
  },
  vhsSonyLogo: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 2,
    fontStyle: "italic",
  },
  vhsSonyR: {
    fontSize: 12,
    fontWeight: "400",
    fontStyle: "normal",
  },
  vhsDotBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  vhsDotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 42,
    gap: 3,
  },
  vhsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cc2200",
  },
  vhsItsSony: {
    fontSize: 9,
    color: "#cc2200",
    fontStyle: "italic",
    fontWeight: "500",
    marginTop: 2,
  },
  // Title section: italic book + huge chapter:verse
  vhsTitleSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  vhsBookItalic: {
    fontSize: 20,
    fontStyle: "italic",
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  vhsChapterBig: {
    fontSize: 52,
    fontWeight: "900",
    color: "#111",
    letterSpacing: -1,
    lineHeight: 56,
  },
  // Color stripes section
  vhsStripesContainer: {
    position: "relative",
    overflow: "hidden",
  },
  vhsStripe: {
    height: 18,
    width: "100%",
  },
  // Dark triangle chevron on right side
  vhsChevron: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "#1a1a1a",
    transform: [{ skewY: "0deg" }],
    // Created via border trick
  },
  // Verse text section
  vhsVerseSection: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    justifyContent: "center",
  },
  vhsVerseText: {
    fontSize: 13,
    color: "#2a2a2a",
    lineHeight: 20,
    fontWeight: "400",
  },
  // Bottom bar
  vhsBottom: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 6,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#d0ccbc",
  },
  vhsBoxLabel: {
    borderWidth: 2,
    borderColor: "#111",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  vhsBoxText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 1,
  },
  vhsBottomInfo: {
    flex: 1,
  },
  vhsBottomBold: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.3,
  },
  vhsBottomSmall: {
    fontSize: 7.5,
    color: "#444",
    letterSpacing: 0.2,
    marginTop: 1,
  },
  vhsActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // ─── Apple Music preset ──────────────────────────────────────────────────
  // Thumbnail
  amThumb: {
    flex: 1,
    backgroundColor: "#1a3a3a",
    borderRadius: 8,
    overflow: "hidden",
    padding: 7,
    gap: 5,
    alignItems: "center",
  },
  amThumbAlbum: {
    width: 38,
    height: 38,
    borderRadius: 4,
    backgroundColor: "#2a5a5a",
    justifyContent: "center",
    alignItems: "center",
  },
  amThumbInfo: {
    width: "100%",
    gap: 2,
  },
  amThumbTitleLine: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 2,
    width: "80%",
  },
  amThumbControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  amThumbPlayBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  amThumbLabel: {
    backgroundColor: "#fc3c44",
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: "center",
  },
  amThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // Full preview
  amFullContainer: {
    flex: 1,
    backgroundColor: "#0d2020",
  },
  amScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  amBackBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  // The capturable card — no fixed height, wraps content
  amCard: {
    width: SCREEN_WIDTH - 32,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  // Absolute background (needs explicit dimensions from content)
  amBgBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  amBgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 35, 35, 0.72)",
  },
  // Content — drives the card height
  amContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 18,
    alignItems: "center",
  },
  amPullBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginBottom: 16,
  },
  // Album art — slightly smaller to leave room for verse
  amAlbumShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  amAlbumArt: {
    width: SCREEN_WIDTH - 120,
    height: SCREEN_WIDTH - 120,
    borderRadius: 8,
  },
  // Song title row — verse text is not clamped (shows all)
  amTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 14,
    gap: 10,
  },
  amTitleInfo: {
    flex: 1,
  },
  amSongTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 3,
  },
  amArtistName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 18,
  },
  amTitleActions: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  // Progress bar
  amProgressContainer: {
    width: "100%",
    marginBottom: 10,
  },
  amProgressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  amProgressFill: {
    width: "32%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  amProgressTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amTimeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  // Playback controls
  amControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "75%",
    marginBottom: 22,
    marginTop: 6,
  },
  // Volume
  amVolumeRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
    marginBottom: 22,
  },
  amVolumeTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  amVolumeFill: {
    width: "70%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 2,
  },
  // Bottom tab icons
  amBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  amActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
    paddingHorizontal: 4,
  },
  // ─── iMessage preset ─────────────────────────────────────────────────────
  // Thumbnail
  imessageThumb: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 4,
  },
  imessageThumbReceived: {
    alignSelf: "flex-start",
    backgroundColor: "#2c2c2e",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    maxWidth: "78%",
  },
  imessageThumbText: {
    fontSize: 6.5,
    color: "#fff",
    lineHeight: 9,
  },
  imessageThumbSentRow: {
    alignItems: "flex-end",
  },
  imessageThumbSent: {
    backgroundColor: "#0a84ff",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    maxWidth: "70%",
  },
  imessageThumbSentText: {
    fontSize: 6.5,
    color: "#fff",
  },
  imessageThumbDelivered: {
    fontSize: 5.5,
    color: "#8e8e93",
    textAlign: "right",
    marginTop: 1,
  },
  imessageThumbLabel: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: "center",
  },
  imessageThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // Full preview
  imessageFullContainer: {
    flex: 1,
    backgroundColor: "#1c1c1e",
  },
  imessageScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  imessageBackBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  // The phone card
  imessagePhone: {
    width: SCREEN_WIDTH - 32,
    minHeight: (SCREEN_WIDTH - 32) * (16 / 9) * 0.62,
    backgroundColor: "#000",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#3a3a3c",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 20,
  },
  imessageStatusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#000",
  },
  imessageStatusTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  imessageStatusIcons: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  // Nav bar — iOS style: left [< avatar] | center [name] | right [video btn]
  imessageNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#000",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2c2c2e",
  },
  imessageNavLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  imessageNavRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  imessageVideoBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1c1c1e",
    justifyContent: "center",
    alignItems: "center",
  },
  imessageAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#636366",
    justifyContent: "center",
    alignItems: "center",
  },
  imessageAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  imessageContactName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  // Thread
  imessageThread: {
    flexGrow: 1,
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6,
  },
  imessageTimestamp: {
    fontSize: 11,
    color: "#8e8e93",
    textAlign: "center",
    marginBottom: 4,
  },
  // Received bubble (left, gray) — verse text
  imessageReceivedRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  imessageAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#636366",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  imessageAvatarSmallText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  imessageReceivedBubble: {
    backgroundColor: "#1c1c1e",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  imessageReceivedText: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
  },
  // Sent bubble (right, blue) — reference
  imessageSentRow: {
    alignSelf: "flex-end",
    maxWidth: "75%",
  },
  imessageSentBubble: {
    backgroundColor: "#0a84ff",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  imessageSentText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  imessageDelivered: {
    fontSize: 11,
    color: "#8e8e93",
    textAlign: "right",
    marginTop: 2,
  },
  // Input bar
  imessageInputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#000",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2c2c2e",
    gap: 8,
    paddingBottom: 24,
  },
  imessageInputBox: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3a3a3c",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  imessageInputPlaceholder: {
    fontSize: 13,
    color: "#636366",
  },
  imessageActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // ─── Calculator / TI-84 preset ───────────────────────────────────────────
  // Thumbnail
  calcThumb: {
    flex: 1,
    backgroundColor: "#c8c8b8",
    borderRadius: 4,
    overflow: "hidden",
    padding: 4,
    gap: 3,
  },
  calcThumbScreen: {
    backgroundColor: "#e8edcc",
    borderWidth: 1,
    borderColor: "#8a8a6a",
    borderRadius: 2,
    padding: 3,
    gap: 2,
    flex: 1,
  },
  calcThumbTitleLine: {
    height: 4,
    backgroundColor: "#8a9a5a",
    borderRadius: 1,
    width: "60%",
  },
  calcThumbBodyLine: {
    height: 2,
    backgroundColor: "#b8c888",
    borderRadius: 1,
  },
  calcThumbKeys: {
    gap: 1,
  },
  calcThumbKeyRow: {
    flexDirection: "row",
    gap: 1,
  },
  calcThumbKey: {
    flex: 1,
    height: 4,
    backgroundColor: "#f0f0e8",
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: "#aaa",
  },
  calcThumbLabel: {
    backgroundColor: "#8a8a7a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: "center",
  },
  calcThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Full preview container
  calcFullContainer: {
    flex: 1,
    backgroundColor: "#a0a090",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  calcBackButton: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Outer device — the whole TI-84 unit
  calcDevice: {
    width: "100%",
    backgroundColor: "#c8c8b0",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#888878",
    overflow: "hidden",
    position: "relative",
  },
  calcCloseBtn: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  calcCloseTxt: {
    fontSize: 8,
    color: "#333",
    fontFamily: "monospace",
  },
  // Inner layout: left bar | main | right bar
  calcFrame: {
    flexDirection: "row",
    padding: 4,
    gap: 3,
  },
  // Left icon toolbar
  calcLeftBar: {
    width: 22,
    backgroundColor: "#b8b8a0",
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 2,
    paddingVertical: 4,
    alignItems: "center",
    gap: 4,
  },
  calcLeftBarBtn: {
    width: 16,
    height: 16,
    backgroundColor: "#d8d8c0",
    borderWidth: 0.5,
    borderColor: "#999",
    borderRadius: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calcLeftBarIcon: {
    fontSize: 8,
  },
  // Main column: screen + keyboard
  calcMain: {
    flex: 1,
    gap: 3,
  },
  // Screen
  calcScreen: {
    backgroundColor: "#d8e8b0",
    borderWidth: 2,
    borderColor: "#6a7a4a",
    borderRadius: 2,
    overflow: "hidden",
  },
  // Top highlighted reference line
  calcTitleLine: {
    backgroundColor: "#8a9a5a",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  calcTitleText: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    color: "#f0f4e0",
    letterSpacing: 0.5,
  },
  // Body area with verse text over ruled lines
  calcBodyArea: {
    minHeight: 100,
    paddingHorizontal: 5,
    paddingTop: 4,
    paddingBottom: 4,
    position: "relative",
  },
  calcBodyText: {
    fontFamily: "monospace",
    fontSize: 9,
    color: "#1a2a0a",
    lineHeight: 18,
    zIndex: 1,
  },
  calcRuledLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#b0c880",
  },
  // Keyboard
  calcKeyboard: {
    backgroundColor: "#d0d0b8",
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 2,
    padding: 3,
    gap: 2,
  },
  calcKeyRow: {
    flexDirection: "row",
    gap: 2,
    justifyContent: "center",
  },
  calcKey: {
    minWidth: 14,
    height: 14,
    backgroundColor: "#f4f4ec",
    borderWidth: 1,
    borderColor: "#aaa",
    borderBottomWidth: 2,
    borderBottomColor: "#888",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  calcKeyWide: {
    minWidth: 26,
  },
  calcKeyMed: {
    minWidth: 22,
  },
  calcKeySpace: {
    flex: 1,
    minWidth: 60,
  },
  calcKeyText: {
    fontFamily: "monospace",
    fontSize: 6,
    color: "#222",
    fontWeight: "600",
  },
  // Right sidebar
  calcRightBar: {
    width: 28,
    gap: 3,
    alignItems: "center",
    paddingTop: 2,
  },
  calcSendBtn: {
    width: 24,
    height: 20,
    backgroundColor: "#e8e8d8",
    borderWidth: 1,
    borderColor: "#999",
    borderBottomWidth: 2,
    borderBottomColor: "#777",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  calcSendBtnPrimary: {
    backgroundColor: "#556644",
  },
  calcSendText: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#333",
    fontWeight: "700",
  },
  calcActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    width: "100%",
    paddingHorizontal: 4,
  },
  // Apple Notes thumbnail styles
  appleNotesThumb: {
    flex: 1,
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  appleNotesThumbHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  appleNotesThumbBook: {
    fontSize: 8,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  appleNotesThumbChapter: {
    fontSize: 7,
    color: "#f0a830",
    fontWeight: "600",
  },
  appleNotesThumbBody: {
    flex: 1,
    gap: 3,
    marginTop: 4,
  },
  appleNotesThumbLine: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 1,
    width: "100%",
  },
  appleNotesThumbCamera: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  appleNotesThumbLabel: {
    backgroundColor: "#f0a830",
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: "center",
  },
  appleNotesThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Apple Notes note mini card inside thumb
  appleNotesThumbNote: {
    flex: 1,
    backgroundColor: "#fffde7",
    margin: 5,
    borderRadius: 4,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Apple Notes full preview styles
  appleNotesFullContainer: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  appleNotesBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  // The capturable card — white background, real Notes look
  appleNotesCapture: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  // Top navigation bar mimicking Apple Notes header
  appleNotesNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  appleNotesNavTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#f0a830",
  },
  // Chapter:verse tag top-right in amber
  appleNotesChapterTag: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f0a830",
  },
  // Note body — white, padded, exactly like Notes
  appleNotesBody: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  // Huge bold title — matches real Apple Notes
  appleNotesBigTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1c1c1e",
    letterSpacing: -0.3,
  },
  // Date + chapter:verse in small gray — matches real Notes metadata line
  appleNotesMetaLine: {
    fontSize: 13,
    color: "#8e8e93",
    marginBottom: 16,
    fontWeight: "400",
  },
  // Verse body text — just like typing in Notes
  appleNotesBodyText: {
    fontSize: 17,
    color: "#1c1c1e",
    lineHeight: 26,
    fontWeight: "400",
    marginBottom: 18,
  },
  // Inline photo attachment — like pasting a photo into Notes
  appleNotesPhotoAttachment: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
    width: "100%",
    aspectRatio: 16 / 9,
  },
  appleNotesAttachedPhoto: {
    width: "100%",
    height: "100%",
  },
  appleNotesBrandLine: {
    fontSize: 13,
    color: "#8e8e93",
    fontStyle: "italic",
    textAlign: "right",
  },
  // We no longer need these old styles but keep them for reference
  appleNotesBgPhoto: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  appleNotesActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // Mail preset thumbnail styles
  mailPresetThumbnail: {
    flex: 1,
    backgroundColor: "#d4cfc8",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#aaa",
  },
  mailThumbTitleBar: {
    backgroundColor: "#e8e0c8",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
  },
  mailThumbTitle: {
    fontSize: 8,
    fontWeight: "900",
    color: "#000",
    fontFamily: "monospace",
  },
  mailThumbMenuRow: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#aaa",
  },
  mailThumbMenu: {
    fontSize: 6,
    color: "#000",
    fontFamily: "monospace",
    textDecorationLine: "underline",
  },
  mailThumbField: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 3,
  },
  mailThumbFieldLabel: {
    fontSize: 6,
    color: "#000",
    fontFamily: "monospace",
    width: 16,
    textAlign: "right",
  },
  mailThumbFieldBox: {
    flex: 1,
    height: 7,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#888",
  },
  mailThumbBody: {
    flex: 1,
    margin: 4,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#888",
    padding: 3,
    gap: 3,
  },
  mailThumbBodyLine: {
    height: 2,
    backgroundColor: "#555",
    borderRadius: 1,
  },
  mailPresetLabel: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  mailPresetLabelText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  // Mail full preview styles
  mailFullContainer: {
    flex: 1,
    backgroundColor: "#e8e0c8",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  mailBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Main window — gray with raised border (Win95 style)
  mailWindow: {
    width: "100%",
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
  },
  mailTitleBar: {
    backgroundColor: "#e8e0c8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#a0a0a0",
  },
  mailTitleText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
    fontFamily: "monospace",
  },
  mailMenuBar: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#a0a0a0",
  },
  mailMenuItem: {
    fontSize: 13,
    color: "#000",
    fontFamily: "monospace",
    textDecorationLine: "underline",
  },
  mailFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  mailFieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    fontFamily: "monospace",
    width: 58,
    textAlign: "right",
  },
  mailFieldBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderRightColor: "#ffffff",
    borderBottomColor: "#ffffff",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  mailFieldValue: {
    flex: 1,
    fontSize: 12,
    color: "#000",
    fontFamily: "monospace",
  },
  mailSubjectBox: {
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
  },
  mailSubjectValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
    fontFamily: "monospace",
  },
  mailDropArrow: {
    width: 16,
    height: 16,
    backgroundColor: "#c0c0c0",
    borderWidth: 1,
    borderTopColor: "#fff",
    borderLeftColor: "#fff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    justifyContent: "center",
    alignItems: "center",
  },
  mailDropArrowText: {
    fontSize: 7,
    color: "#000",
    lineHeight: 10,
  },
  mailDivider: {
    height: 1,
    backgroundColor: "#808080",
    marginHorizontal: 12,
    marginVertical: 4,
  },
  mailBody: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderRightColor: "#ffffff",
    borderBottomColor: "#ffffff",
    minHeight: 120,
  },
  mailBodyText: {
    flex: 1,
    fontSize: 13,
    color: "#000",
    fontFamily: "monospace",
    lineHeight: 20,
    padding: 8,
  },
  mailScrollbar: {
    width: 14,
    backgroundColor: "#c0c0c0",
    borderLeftWidth: 1,
    borderLeftColor: "#808080",
    alignItems: "center",
    paddingTop: 2,
  },
  mailScrollbarThumb: {
    width: 10,
    height: 20,
    backgroundColor: "#c0c0c0",
    borderWidth: 1,
    borderTopColor: "#fff",
    borderLeftColor: "#fff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  mailButtonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  mailBtn: {
    flex: 1,
    backgroundColor: "#c0c0c0",
    borderWidth: 1.5,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    paddingVertical: 6,
    alignItems: "center",
  },
  mailBtnText: {
    fontSize: 13,
    color: "#000",
    fontFamily: "monospace",
    fontWeight: "600",
  },
  mailActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // Nokia preset thumbnail styles
  nokiaPresetThumbnail: {
    flex: 1,
    backgroundColor: "#b0a898",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 6,
  },
  nokiaThumbBody: {
    width: "65%",
    alignItems: "center",
    gap: 4,
  },
  nokiaThumbScreen: {
    width: "100%",
    backgroundColor: "#a8d8c0",
    borderRadius: 2,
    padding: 3,
    borderWidth: 1,
    borderColor: "#555",
  },
  nokiaThumbSignal: {
    fontSize: 5,
    color: "#222",
  },
  nokiaThumbText: {
    fontSize: 6,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 2,
  },
  nokiaThumbLine: {
    height: 3,
    backgroundColor: "#444",
    borderRadius: 1,
    width: "100%",
    marginBottom: 2,
  },
  nokiaThumbKeypad: {
    width: "100%",
    gap: 2,
  },
  nokiaThumbKeyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2,
  },
  nokiaThumbKey: {
    flex: 1,
    height: 5,
    backgroundColor: "#c8bfb4",
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#888",
  },
  nokiaPresetLabel: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  nokiaPresetLabelText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700",
  },
  // Nokia full preview styles
  nokiaFullContainer: {
    flex: 1,
    backgroundColor: "#888880",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  nokiaBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  // Main Nokia body — silvery, tall, wide-shouldered
  nokiaBody: {
    width: "72%",
    backgroundColor: "#c8bfb4",
    borderRadius: 32,
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#aaa098",
  },
  nokiaSpeakerDots: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  nokiaDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#8a8278",
    borderWidth: 0.5,
    borderColor: "#666",
  },
  nokiaScreenBezel: {
    width: "100%",
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    padding: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  nokiaScreen: {
    backgroundColor: "#a8d8c0",
    borderRadius: 5,
    padding: 8,
    minHeight: 120,
  },
  nokiaStatusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nokiaSignal: {
    fontSize: 9,
    color: "#1a1a1a",
    letterSpacing: -1,
  },
  nokiaBatteryOuter: {
    width: 18,
    height: 9,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#1a1a1a",
    padding: 1,
    justifyContent: "center",
  },
  nokiaBatteryFill: {
    width: "80%",
    height: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 1,
  },
  nokiaVerseRef: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0a0a0a",
    textAlign: "center",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  nokiaSeparator: {
    height: 1,
    backgroundColor: "#1a1a1a",
    marginBottom: 6,
    opacity: 0.4,
  },
  nokiaVerseText: {
    fontSize: 11,
    color: "#0a0a0a",
    lineHeight: 17,
    fontFamily: "monospace",
    textAlign: "center",
  },
  nokiaBrand: {
    fontSize: 9,
    color: "#1a4a2a",
    textAlign: "center",
    marginTop: 6,
    fontStyle: "italic",
    fontFamily: "monospace",
  },
  nokiaNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
    width: "100%",
  },
  nokiaNavSide: {
    width: 40,
    height: 20,
    backgroundColor: "#b0a898",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#888",
  },
  nokiaNavCenter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#b0a898",
    borderWidth: 1.5,
    borderColor: "#888",
  },
  nokiaKeyRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 5,
    width: "100%",
  },
  nokiaKey: {
    flex: 1,
    height: 22,
    backgroundColor: "#d4ccc4",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a09890",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  nokiaKeyText: {
    fontSize: 7,
    fontWeight: "600",
    color: "#2a2a2a",
    letterSpacing: 0.3,
  },
  nokiaWordmark: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a3a5a",
    letterSpacing: 4,
    marginTop: 8,
  },
  nokiaActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // iPod preset thumbnail styles
  ipodPresetThumbnail: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c0c0c0",
  },
  ipodThumbScreen: {
    width: "100%",
    backgroundColor: "#1a1a2e",
    borderRadius: 2,
    padding: 3,
    flex: 1,
    marginBottom: 4,
  },
  ipodThumbAnchor: {
    fontSize: 6,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  ipodThumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ipodThumbBlueItem: {
    width: 18,
    height: 7,
    backgroundColor: "#2563eb",
    borderRadius: 1,
  },
  ipodThumbTextLines: {
    flex: 1,
    gap: 2,
  },
  ipodThumbLine: {
    height: 2,
    backgroundColor: "#ccc",
    borderRadius: 1,
    width: "100%",
  },
  ipodThumbWheel: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#d8d8d8",
    borderWidth: 1,
    borderColor: "#aaa",
  },
  ipodPresetLabel: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  ipodPresetLabelText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // iPod full preview styles
  ipodFullContainer: {
    flex: 1,
    backgroundColor: "#d8d8d8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  ipodBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  // Main iPod body — white/silver, tall rounded rectangle
  ipodBody: {
    width: "82%",
    backgroundColor: "#f0f0f0",
    borderRadius: 28,
    paddingTop: 14,
    paddingBottom: 20,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#c8c8c8",
  },
  // Dark bezel around screen
  ipodScreenBezel: {
    width: "100%",
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 4,
    marginBottom: 18,
  },
  // White screen inside bezel
  ipodScreen: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 5,
    overflow: "hidden",
  },
  // Thin top status bar: "Anchor" left, play+battery right
  ipodScreenTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4a90d9",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ipodAnchorLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  ipodBatteryOuter: {
    width: 18,
    height: 9,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    padding: 1,
    justifyContent: "center",
  },
  ipodBatteryFill: {
    width: "75%",
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 1,
  },
  // Two-panel content area
  ipodContentArea: {
    flexDirection: "row",
    minHeight: 140,
    backgroundColor: "#ffffff",
  },
  // Left list panel
  ipodMenuList: {
    width: "42%",
    backgroundColor: "#ffffff",
  },
  ipodMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  ipodMenuItemSelected: {
    backgroundColor: "#2563eb",
  },
  ipodMenuItemText: {
    fontSize: 11,
    color: "#1a1a1a",
    fontWeight: "500",
    flex: 1,
  },
  ipodMenuItemTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  ipodMenuItemArrow: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "300",
    marginLeft: 2,
  },
  // Thin vertical divider
  ipodDivider: {
    width: 1,
    backgroundColor: "#d0d0d0",
  },
  // Right verse panel
  ipodVersePanel: {
    flex: 1,
    padding: 8,
    backgroundColor: "#ffffff",
  },
  ipodVerseRef: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  ipodVerseText: {
    fontSize: 10,
    color: "#333",
    lineHeight: 15,
  },
  // Click wheel area
  ipodWheelContainer: {
    width: "100%",
    alignItems: "center",
  },
  // The full wheel (outer ring + center button combined)
  ipodWheelOuter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "#e2e2e2",
    borderWidth: 1,
    borderColor: "#c0c0c0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  // Center button
  ipodWheelCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#c0c0c0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ipodWheelMenu: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    fontSize: 9,
    fontWeight: "700",
    color: "#555",
    letterSpacing: 1.5,
  },
  ipodWheelPlay: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
  },
  ipodWheelBack: {
    position: "absolute",
    left: 12,
    top: "50%",
    marginTop: -8,
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
  },
  ipodWheelFwd: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -8,
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
  },
  ipodActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  // Anchor Search preset thumbnail styles
  searchPresetThumbnail: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
  },
  searchPresetLogoThumb: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  searchPresetBar: {
    width: "90%",
    height: 8,
    backgroundColor: "#e8eaed",
    borderRadius: 4,
    marginBottom: 5,
  },
  searchPresetLine: {
    width: "80%",
    height: 5,
    backgroundColor: "#f1f3f4",
    borderRadius: 3,
    marginBottom: 3,
  },
  searchPresetLabel: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(66,133,244,0.12)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  searchPresetLabelText: {
    fontSize: 10,
    color: "#4285F4",
    fontWeight: "600",
  },
  // Anchor Search template styles
  searchFullContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  searchBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  searchCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  searchHeader: {
    paddingVertical: 18,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
  },
  searchLogoText: {
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: 1,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#dfe1e5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarText: {
    flex: 1,
    fontSize: 15,
    color: "#202124",
    fontWeight: "400",
  },
  searchDivider: {
    height: 1,
    backgroundColor: "#e8eaed",
    marginTop: 14,
    marginHorizontal: 0,
  },
  searchResults: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  searchResultIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  searchResultTitle: {
    fontSize: 14,
    color: "#1a0dab",
    fontWeight: "400",
    lineHeight: 20,
    marginBottom: 2,
  },
  searchResultUrl: {
    fontSize: 12,
    color: "#006621",
    marginTop: 1,
  },
  searchVerseBlock: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#4285F4",
  },
  searchVerseBlockTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a0dab",
    marginBottom: 6,
  },
  searchVerseBlockText: {
    fontSize: 14,
    color: "#202124",
    lineHeight: 21,
    fontStyle: "italic",
  },
  searchVerseBlockSource: {
    fontSize: 11,
    color: "#70757a",
    marginTop: 6,
    fontStyle: "italic",
  },
  searchActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },

  // ── Mac OS Thumbnail ─────────────────────────────────────────────
  macosThumb: {
    flex: 1,
    backgroundColor: "#c0c0c0",
    overflow: "hidden",
  },
  macosThumbMenuBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    height: 18,
    paddingHorizontal: 3,
    gap: 4,
  },
  macosThumbDiamond: {
    fontSize: 8,
    fontFamily: "System",
    color: "#000",
  },
  macosThumbMenuActive: {
    backgroundColor: "#000",
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  macosThumbMenuActiveText: {
    color: "#fff",
    fontSize: 8,
    fontFamily: "System",
    fontWeight: "700",
  },
  macosThumbMenuItem: {
    color: "#000",
    fontSize: 8,
    fontFamily: "System",
  },
  macosThumbDropdown: {
    position: "absolute",
    top: 18,
    left: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  macosThumbDropItem: {
    fontSize: 7,
    fontFamily: "System",
    color: "#000",
    fontWeight: "600",
    paddingVertical: 1,
  },
  macosThumbDropDivider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 1,
  },
  macosThumbDropVerse: {
    fontSize: 6,
    fontFamily: "System",
    color: "#000",
    paddingVertical: 1,
    maxWidth: 70,
  },

  // ── Mac OS Full Preview ───────────────────────────────────────────
  macosBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  macosFullContainer: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#000",
  },
  macosDesktop: {
    flex: 1,
  },
  macosMenuBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    height: 30,
    paddingHorizontal: 8,
    gap: 4,
  },
  macosDiamond: {
    fontSize: 14,
    fontFamily: "System",
    color: "#000",
    marginRight: 4,
  },
  macosMenuActiveItem: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  macosMenuActiveText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "System",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  macosMenuOtherItem: {
    color: "#000",
    fontSize: 12,
    fontFamily: "System",
    fontWeight: "400",
    marginHorizontal: 4,
  },
  macosDesktopArea: {
    minHeight: 280,
    padding: 12,
  },
  macosIconTopRight: {
    position: "absolute",
    top: 10,
    right: 12,
    alignItems: "center",
    gap: 4,
  },
  macosHDIcon: {
    width: 36,
    height: 28,
    borderWidth: 1.5,
    borderColor: "#000",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  macosHDIconInner: {
    width: 22,
    height: 6,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#c0c0c0",
  },
  macosIconLabel: {
    fontSize: 9,
    fontFamily: "System",
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
  },
  macosDropdown: {
    marginTop: 4,
    marginLeft: 4,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    maxWidth: SCREEN_WIDTH - 100,
    alignSelf: "flex-start",
  },
  macosDropdownItem: {
    fontSize: 13,
    fontFamily: "System",
    color: "#000",
    paddingHorizontal: 16,
    paddingVertical: 4,
    letterSpacing: 0.1,
  },
  macosDropdownDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  macosDropdownSeparator: {
    height: 1,
    backgroundColor: "#000",
    marginHorizontal: 0,
    marginVertical: 4,
  },
  macosDropdownFooter: {
    fontSize: 11,
    fontFamily: "System",
    color: "#000",
    paddingHorizontal: 16,
    paddingVertical: 3,
    fontStyle: "italic",
  },
  macosIconBottomRight: {
    position: "absolute",
    bottom: 10,
    right: 12,
    alignItems: "center",
    gap: 4,
  },
  macosTrashIcon: {
    width: 30,
    height: 34,
    borderWidth: 1.5,
    borderColor: "#000",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  macosTrashLid: {
    height: 6,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  macosTrashBody: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  macosTrashLine: {
    width: 2,
    height: 14,
    backgroundColor: "#000",
  },

  // ── Receipt Thumbnail ────────────────────────────────────────────
  receiptThumb: {
    flex: 1,
    backgroundColor: "#f9f8f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: 6,
  },
  receiptThumbTitle: {
    fontSize: 8,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 11,
    marginBottom: 4,
  },
  receiptThumbDivider: {
    width: "90%",
    height: 1,
    borderStyle: "dotted",
    borderWidth: 1,
    borderColor: "#aaa",
    marginVertical: 3,
  },
  receiptThumbRow: {
    fontSize: 6,
    color: "#333",
    width: "100%",
  },
  receiptThumbBarcode: {
    fontSize: 9,
    color: "#111",
    letterSpacing: 1,
    marginTop: 3,
  },
  receiptThumbLabel: {
    backgroundColor: "#111",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
  },
  receiptThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 2,
  },

  // ── Receipt Full Preview ─────────────────────────────────────────
  receiptFullContainer: {
    flex: 1,
    backgroundColor: "#f0ede6",
  },
  receiptBackBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 6,
  },
  receiptScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  receiptPaper: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: "#f9f8f5",
    borderRadius: 3,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  receiptTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
    letterSpacing: 1,
    lineHeight: 30,
  },
  receiptStoreHeader: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
    letterSpacing: 1,
    lineHeight: 30,
  },
  receiptSubtag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 4,
  },
  receiptSpacer: {
    height: 24,
  },
  receiptItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 3,
  },
  receiptItemName: {
    fontSize: 13,
    color: "#222",
    flex: 1,
    flexWrap: "wrap",
    paddingRight: 8,
    letterSpacing: 0.2,
  },
  receiptVerseLineItem: {
    fontSize: 13,
    color: "#222",
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  receiptItemPaid: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.5,
  },
  receiptEquals: {
    fontSize: 11,
    color: "#555",
    letterSpacing: 1,
    marginVertical: 8,
  },
  receiptSubtotalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  receiptSubtotalValue: {
    fontSize: 13,
    color: "#222",
  },
  receiptGrandLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    flex: 1,
    letterSpacing: 0.5,
  },
  receiptGrandValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },
  receiptCardNum: {
    fontSize: 12,
    color: "#444",
    letterSpacing: 1,
    marginTop: 6,
  },
  receiptItemPrice: {
    fontSize: 13,
    color: "#222",
    fontWeight: "600",
    flexShrink: 0,
  },
  receiptTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 16,
  },
  receiptTotalLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 1,
  },
  receiptTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  receiptDottedLine: {
    width: "100%",
    borderTopWidth: 1.5,
    borderTopColor: "#aaa",
    borderStyle: "dotted",
    marginBottom: 16,
  },
  receiptNonRefundable: {
    fontSize: 11,
    fontWeight: "700",
    color: "#444",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  receiptBarcodeContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 52,
    marginBottom: 16,
  },
  receiptBar: {
    height: 44,
    backgroundColor: "#111",
  },
  receiptValidText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
    letterSpacing: 1.5,
  },

  // ── AirDrop Thumbnail ─────────────────────────────────────────────
  airdropThumb: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    overflow: "hidden",
  },
  airdropThumbHeader: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d1d6",
  },
  airdropThumbTitle: {
    fontSize: 7,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  airdropThumbPhoto: {
    flex: 1,
    backgroundColor: "#e5e5ea",
    alignItems: "center",
    justifyContent: "center",
  },
  airdropThumbFooter: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 0.5,
    borderTopColor: "#d1d1d6",
    height: 22,
  },
  airdropThumbDecline: {
    flex: 1,
    textAlign: "center",
    fontSize: 7,
    color: "#007aff",
    lineHeight: 22,
  },
  airdropThumbDivider: {
    width: 0.5,
    backgroundColor: "#d1d1d6",
  },
  airdropThumbAccept: {
    flex: 1,
    textAlign: "center",
    fontSize: 7,
    color: "#007aff",
    lineHeight: 22,
  },
  airdropThumbLabel: {
    backgroundColor: "#007aff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
  },
  airdropThumbLabelText: {
    fontSize: 7,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  // ── AirDrop Full Preview ──────────────────────────────────────────
  airdropFullContainer: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    justifyContent: "center",
    alignItems: "center",
  },
  airdropBackBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  airdropCenterWrapper: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 28,
  },
  airdropScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  airdropCard: {
    backgroundColor: "#f2f2f7",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    marginBottom: 24,
  },
  airdropCardHeader: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d1d6",
  },
  airdropCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 4,
  },
  airdropCardSubtitle: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 18,
  },
  airdropCardPhoto: {
    aspectRatio: 4 / 3,
    backgroundColor: "#e5e5ea",
  },
  airdropCardFooter: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 0.5,
    borderTopColor: "#d1d1d6",
    height: 52,
  },
  airdropDeclineBtn: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    color: "#007aff",
    lineHeight: 52,
  },
  airdropFooterDivider: {
    width: 0.5,
    backgroundColor: "#d1d1d6",
  },
  airdropAcceptBtn: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    color: "#007aff",
    lineHeight: 52,
  },

  // ── Screen Time Thumbnail ──────────────────────────────────────────
  stThumbContainer: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 8,
    overflow: "hidden",
    padding: 6,
  },
  stThumbHeader: {
    marginBottom: 4,
  },
  stThumbLine: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 1,
  },
  stThumbBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 30,
    marginBottom: 2,
  },
  stThumbBar: {
    width: 5,
    backgroundColor: "#5ac8fa",
    borderRadius: 1.5,
  },
  stThumbDays: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stThumbDayText: {
    fontSize: 4,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },
  stThumbLabel: {
    backgroundColor: "#000000",
    paddingVertical: 4,
    alignItems: "center",
  },
  stThumbLabelText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Screen Time Template ──────────────────────────────────────────
  stFullContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  stBackBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  stScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  stCard: {
    width: SCREEN_WIDTH,
    backgroundColor: "#000000",
    paddingTop: 6,
  },
  stNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stNavBackRow: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
  },
  stNavBack: {
    fontSize: 17,
    color: "#007aff",
  },
  stNavTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  stSectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: "#000000",
  },
  stSectionHeaderText: {
    fontSize: 13,
    color: "#8e8e93",
    letterSpacing: 0.5,
  },
  stDailySection: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 14,
    marginBottom: 2,
  },
  stDailyLabel: {
    fontSize: 13,
    color: "#8e8e93",
    marginBottom: 4,
  },
  stDailyRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 10,
  },
  stDailyTime: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
  },
  stDailyChange: {
    fontSize: 13,
    color: "#8e8e93",
  },
  stChartArea: {
    height: 110,
    position: "relative",
    marginBottom: 6,
  },
  stGridLine: {
    position: "absolute",
    left: 0,
    right: 30,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  stYLabel: {
    position: "absolute",
    right: 0,
    fontSize: 10,
    color: "#8e8e93",
  },
  stAvgLine: {
    position: "absolute",
    left: 0,
    right: 30,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: "#34c759",
    borderStyle: "dashed",
  },
  stAvgLabel: {
    position: "absolute",
    right: 0,
    fontSize: 11,
    color: "#34c759",
    fontWeight: "600",
  },
  stBarsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    position: "absolute",
    left: 0,
    right: 30,
    bottom: 0,
    top: 0,
  },
  stBarWrapper: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  stBar: {
    width: 22,
    backgroundColor: "#5ac8fa",
    borderRadius: 4,
  },
  stDayLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingRight: 30,
  },
  stDayText: {
    fontSize: 11,
    color: "#8e8e93",
    fontWeight: "500",
  },
  stMenuRow: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  stMenuText: {
    fontSize: 17,
    color: "#fff",
  },
  stUpdatedText: {
    fontSize: 13,
    color: "#8e8e93",
  },
  stVerseSection: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 12,
    marginBottom: 6,
  },
  stVerseText: {
    fontSize: 14,
    color: "#fff",
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 6,
  },
  stVerseRef: {
    fontSize: 13,
    color: "#5ac8fa",
    fontWeight: "600",
  },
  stMenuGroup: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  stMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stMenuIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stMenuContent: {
    flex: 1,
  },
  stMenuItemTitle: {
    fontSize: 15,
    color: "#fff",
  },
  stMenuItemSub: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 1,
  },
  stMenuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginLeft: 58,
  },

  // ── Notification Thumbnail ─────────────────────────────────────────
  notifThumbContainer: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    padding: 6,
  },
  notifThumbBanner: {
    backgroundColor: "#e8e8ed",
    borderRadius: 6,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  notifThumbIcon: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#34c759",
    marginRight: 4,
  },
  notifThumbBodyArea: {
    backgroundColor: "#e8e8ed",
    borderRadius: 6,
    padding: 5,
    gap: 3,
  },
  notifThumbLine: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 1,
  },
  notifThumbGrabber: {
    width: 20,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
    alignSelf: "center",
    marginTop: 3,
  },
  notifThumbLabel: {
    backgroundColor: "#000000",
    paddingVertical: 4,
    alignItems: "center",
  },
  notifThumbLabelText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Notification Template ─────────────────────────────────────────
  notifFullContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  notifBackBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  notifScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  notifCaptureArea: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#000000",
    paddingVertical: 40,
    alignItems: "center",
  },
  notifBanner: {
    width: "100%",
    backgroundColor: "#e8e8ed",
    borderRadius: 16,
    overflow: "hidden",
  },
  notifHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  notifAppIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#34c759",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  notifAppName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#8e8e93",
    letterSpacing: 1,
  },
  notifTime: {
    fontSize: 13,
    color: "#8e8e93",
  },
  notifHeaderDivider: {
    height: 1,
    backgroundColor: "#d1d1d6",
    marginHorizontal: 14,
  },
  notifBodyArea: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  notifSender: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1c1c1e",
    marginBottom: 3,
  },
  notifMessage: {
    fontSize: 15,
    color: "#3a3a3c",
    lineHeight: 20,
  },
  notifGrabberRow: {
    alignItems: "center",
    paddingBottom: 8,
  },
  notifGrabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c7c7cc",
  },

  // ── Tweet Thumbnail ────────────────────────────────────────────────
  tweetThumbContainer: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 8,
    overflow: "hidden",
    padding: 6,
  },
  tweetThumbHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tweetThumbAvatar: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1a1a1a",
    marginRight: 4,
  },
  tweetThumbBody: {
    marginBottom: 4,
  },
  tweetThumbLine: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 1,
    marginVertical: 1.5,
  },
  tweetThumbActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 2,
  },
  tweetThumbActionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tweetThumbLabel: {
    backgroundColor: "#000000",
    paddingVertical: 4,
    alignItems: "center",
  },
  tweetThumbLabelText: {
    color: "#1d9bf0",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Tweet Template ────────────────────────────────────────────────
  tweetFullContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  tweetBackBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  tweetScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  tweetCard: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#000000",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#2f3336",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  tweetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tweetAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tweetUserInfo: {
    flex: 1,
  },
  tweetNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tweetDisplayName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#e7e9ea",
  },
  tweetHandle: {
    fontSize: 14,
    color: "#71767b",
    marginTop: 1,
  },
  tweetBody: {
    fontSize: 17,
    color: "#e7e9ea",
    lineHeight: 24,
    marginBottom: 8,
  },
  tweetReference: {
    fontSize: 15,
    color: "#1d9bf0",
    marginBottom: 12,
  },
  tweetTimestamp: {
    fontSize: 14,
    color: "#71767b",
    marginBottom: 12,
  },
  tweetDivider: {
    height: 1,
    backgroundColor: "#2f3336",
    marginBottom: 12,
  },
  tweetStatsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  tweetStat: {
    fontSize: 14,
    color: "#71767b",
  },
  tweetStatBold: {
    fontWeight: "700",
    color: "#e7e9ea",
  },
  tweetActionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },

  // ── Ticket Stub Thumbnail ─────────────────────────────────────────
  ticketStubThumbContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
  },
  ticketStubThumbTop: {
    flex: 1,
    padding: 4,
  },
  ticketStubThumbTitle: {
    color: "#000",
    fontSize: 5,
    fontWeight: "900",
    letterSpacing: 1,
    backgroundColor: "#ffffff",
    textAlign: "center",
    paddingVertical: 2,
    marginBottom: 3,
  },
  ticketStubThumbLine: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 1.5,
  },
  ticketStubThumbTear: {
    width: 1,
    backgroundColor: "transparent",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
  },
  ticketStubThumbBottom: {
    width: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  ticketStubThumbInfoRow: {
    marginVertical: 1,
    alignItems: "center",
  },
  ticketStubThumbInfoBox: {
    width: 14,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 1,
  },
  ticketStubThumbLabel: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 4,
    alignItems: "center",
  },
  ticketStubThumbLabelText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Ticket Stub Template ──────────────────────────────────────────
  ticketStubFullContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  ticketStubBackBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  ticketStubScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 32,
  },
  ticketStubCard: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  ticketStubTopBar: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    alignItems: "center",
  },
  ticketStubTopBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ticketStubTopBarText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 4,
  },
  ticketStubImageArea: {
    height: 220,
    backgroundColor: "#111",
  },
  ticketStubImage: {
    width: "100%",
    height: "100%",
  },
  ticketStubImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  ticketStubVerseArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1a1a1a",
  },
  ticketStubVerseText: {
    fontSize: 16,
    color: "#ffffff",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 8,
  },
  ticketStubReference: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ticketStubMainInfoRow: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  ticketStubMainInfoItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  ticketStubMainInfoLabel: {
    fontSize: 9,
    color: "#666",
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 3,
  },
  ticketStubMainInfoValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "800",
  },
  ticketStubMainInfoDivider: {
    width: 1,
    backgroundColor: "#2a2a2a",
  },
  // ── Horizontal perforation ──
  ticketStubPerforation: {
    flexDirection: "row",
    height: 20,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  ticketStubPerfDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#000",
  },
  ticketStubPerfNotchLeft: {
    position: "absolute",
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  ticketStubPerfNotchRight: {
    position: "absolute",
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  // ── Tear-off stub (bottom) ──
  ticketStubTearOff: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  ticketStubTearRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 14,
  },
  ticketStubTearInfoItem: {
    alignItems: "center",
  },
  ticketStubTearLabel: {
    fontSize: 8,
    color: "#666",
    fontWeight: "800",
    letterSpacing: 2,
  },
  ticketStubTearValue: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "900",
    marginTop: 2,
  },
  ticketStubBarcodeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 32,
    marginBottom: 10,
  },
  ticketStubBar: {
    height: 28,
    backgroundColor: "#fff",
  },
  ticketStubTearAdmit: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: 6,
  },

  // ── Progress Bar Thumbnail ──────────────────────────────────────────
  pbThumbContainer: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    borderRadius: 8,
    overflow: "hidden",
    padding: 8,
    justifyContent: "center",
  },
  pbThumbIconRow: {
    marginBottom: 4,
  },
  pbThumbIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },
  pbThumbPercent: {
    marginBottom: 4,
  },
  pbThumbPercentText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  pbThumbBarBg: {
    height: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 3,
    overflow: "hidden",
  },
  pbThumbBarFill: {
    width: "65%",
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 3,
  },
  pbThumbLabel: {
    backgroundColor: "#000000",
    paddingVertical: 4,
    alignItems: "center",
  },
  pbThumbLabelText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Progress Bar Template ──────────────────────────────────────────
  pbFullContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  pbBackBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  pbScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  pbCard: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
  },
  pbLogoRow: {
    marginBottom: 16,
  },
  pbTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  pbTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  pbBadge: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pbBadgeText: {
    fontSize: 12,
    color: "#8e8e93",
    fontWeight: "500",
  },
  pbPercentage: {
    fontSize: 48,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 16,
  },
  pbBarContainer: {
    marginBottom: 20,
  },
  pbBarBackground: {
    height: 28,
    backgroundColor: "#2a2a2a",
    borderRadius: 14,
    overflow: "hidden",
  },
  pbBarFill: {
    height: "100%",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  pbBarGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  pbDueContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  pbDueText: {
    fontSize: 15,
    color: "#8e8e93",
    fontWeight: "500",
  },
  pbVerseSection: {
    marginBottom: 20,
  },
  pbVerseText: {
    fontSize: 16,
    color: "#ffffff",
    lineHeight: 24,
    fontWeight: "400",
  },
  pbBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  pbBookInfo: {
    gap: 2,
  },
  pbBookLabel: {
    fontSize: 13,
    color: "#8e8e93",
    fontWeight: "500",
  },
  pbChapterLabel: {
    fontSize: 11,
    color: "#48484a",
    fontWeight: "500",
  },
  pbMoreBtn: {
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pbMoreText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  pbActionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    paddingVertical: 16,
    backgroundColor: "#000000",
  },
  pbActionBtn: {
    alignItems: "center",
    gap: 4,
  },
  pbActionText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },

  // ── XP Open Thumbnail ────────────────────────────────────────────
  xpThumbContainer: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 4,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  xpThumbTitleBar: {
    width: "100%",
    backgroundColor: "#0055E5",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  xpThumbTitleText: {
    fontSize: 5,
    fontWeight: "700",
    color: "#fff",
  },
  xpThumbX: {
    fontSize: 6,
    color: "#fff",
    fontWeight: "700",
  },
  xpThumbBody: {
    width: "100%",
    backgroundColor: "#ECE9D8",
    flexDirection: "row",
    flex: 1,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  xpThumbSidebar: {
    width: 18,
    backgroundColor: "#D6D2C2",
    padding: 2,
    gap: 3,
    alignItems: "center",
    paddingTop: 4,
  },
  xpThumbSideIcon: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  xpThumbPreview: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  xpThumbLabel: {
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: "center",
  },
  xpThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── XP Open Full Preview ────────────────────────────────────────
  xpBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  xpContainer: {
    width: SCREEN_WIDTH - 24,
    backgroundColor: "#000",
    borderRadius: 4,
    padding: 16,
    alignItems: "center",
  },
  xpWindow: {
    width: "100%",
    backgroundColor: "#ECE9D8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0055E5",
    overflow: "hidden",
  },
  xpTitleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#0055E5",
  },
  xpTitleBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  xpTitleIcon: {
    width: 20,
    height: 20,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  xpTitleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  xpTitleBarButtons: {
    flexDirection: "row",
    gap: 4,
  },
  xpTitleBtn: {
    width: 22,
    height: 20,
    backgroundColor: "#ECE9D8",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  xpTitleBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
  },
  xpCloseBtn: {
    backgroundColor: "#D94836",
    borderColor: "#B73425",
  },
  xpCloseBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  xpToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    gap: 8,
  },
  xpToolbarLabel: {
    fontSize: 12,
    color: "#333",
  },
  xpToolbarDropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#7F9DB9",
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  xpToolbarDropdownText: {
    fontSize: 12,
    color: "#333",
  },
  xpContentRow: {
    flexDirection: "row",
    height: 260,
  },
  xpSidebar: {
    width: 76,
    backgroundColor: "#D6D2C2",
    paddingVertical: 10,
    alignItems: "center",
    gap: 8,
    borderRightWidth: 1,
    borderRightColor: "#bbb",
  },
  xpSidebarItem: {
    alignItems: "center",
    gap: 2,
    width: 60,
  },
  xpSidebarLabel: {
    fontSize: 8,
    color: "#333",
    textAlign: "center",
  },
  xpPreviewArea: {
    flex: 1,
    margin: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#7F9DB9",
    overflow: "hidden",
  },
  xpPhoto: {
    ...StyleSheet.absoluteFillObject,
  },
  xpVerseOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  xpVerseText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
    lineHeight: 19,
  },
  xpVerseRef: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontWeight: "500",
  },
  xpBottomBar: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    gap: 6,
  },
  xpBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  xpBottomLabel: {
    fontSize: 11,
    color: "#333",
    width: 72,
    textAlign: "right",
  },
  xpBottomInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#7F9DB9",
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  xpBottomInputText: {
    fontSize: 11,
    color: "#333",
  },
  xpOpenBtn: {
    backgroundColor: "#ECE9D8",
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 3,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  xpOpenBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  xpCancelBtn: {
    backgroundColor: "#ECE9D8",
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  xpCancelBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },

  // ── Postcard Thumbnail ───────────────────────────────────────────
  pcThumbContainer: {
    flex: 1,
    backgroundColor: "#F5E6C8",
    borderRadius: 6,
    padding: 3,
  },
  pcThumbBorder: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#D4A534",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  pcThumbGreetings: {
    fontSize: 5,
    fontStyle: "italic",
    color: "#666",
  },
  pcThumbBook: {
    fontSize: 10,
    fontWeight: "900",
    color: "#2E5339",
    letterSpacing: 1,
  },
  pcThumbVerse: {
    fontSize: 6,
    fontWeight: "600",
    color: "#8B6914",
  },
  pcThumbLabel: {
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: "center",
  },
  pcThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Postcard Full Preview ───────────────────────────────────────
  pcBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  pcCardFront: {
    width: SCREEN_WIDTH - 24,
    aspectRatio: 1.5,
    backgroundColor: "#F5E6C8",
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pcFrontInner: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#D4A534",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    overflow: "hidden",
  },
  pcSparkle1: {
    position: "absolute",
    top: 18,
    right: 30,
    fontSize: 14,
    color: "#D4A534",
  },
  pcSparkle2: {
    position: "absolute",
    top: 40,
    left: 24,
    fontSize: 10,
    color: "#D4A534",
  },
  pcSparkle3: {
    position: "absolute",
    bottom: 50,
    right: 22,
    fontSize: 12,
    color: "#C49B2A",
  },
  pcSparkle4: {
    position: "absolute",
    top: 22,
    left: 50,
    fontSize: 8,
    color: "#D4A534",
  },
  pcSparkle5: {
    position: "absolute",
    bottom: 40,
    left: 36,
    fontSize: 10,
    color: "#C49B2A",
  },
  pcGreetingsText: {
    fontFamily: "Caveat",
    fontSize: 22,
    color: "#555",
    marginBottom: 4,
  },
  pcBookName: {
    fontSize: 44,
    fontWeight: "900",
    color: "#2E5339",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 0,
  },
  pcChapterVerse: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8B6914",
    letterSpacing: 1,
    marginTop: 4,
  },
  pcFrontFooter: {
    position: "absolute",
    bottom: 12,
  },
  pcFrontFooterText: {
    fontSize: 10,
    color: "rgba(0,0,0,0.3)",
    fontWeight: "600",
    letterSpacing: 1,
  },

  // ── Postcard Back ───────────────────────────────────────────────
  pcCardBack: {
    width: SCREEN_WIDTH - 24,
    aspectRatio: 1.5,
    backgroundColor: "#FFFEF7",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pcStampArea: {
    position: "absolute",
    top: 16,
    right: 20,
  },
  pcStamp: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fefefe",
  },
  pcStampText: {
    fontSize: 22,
  },
  pcPostmark: {
    position: "absolute",
    top: 20,
    right: 72,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(180,40,40,0.3)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-15deg" }],
  },
  pcPostmarkText: {
    fontSize: 7,
    fontWeight: "800",
    color: "rgba(180,40,40,0.4)",
    letterSpacing: 1,
  },
  pcPostmarkDate: {
    fontSize: 6,
    fontWeight: "600",
    color: "rgba(180,40,40,0.3)",
  },
  pcCenterDivider: {
    position: "absolute",
    top: 16,
    bottom: 16,
    left: "50%",
    width: 1,
    backgroundColor: "#ddd",
  },
  pcLeftSide: {
    width: "48%",
    paddingTop: 8,
    paddingRight: 12,
    flex: 1,
    justifyContent: "center",
  },
  pcVerseText: {
    fontFamily: "Caveat",
    fontSize: 18,
    color: "#333",
    lineHeight: 26,
    marginBottom: 12,
  },
  pcVerseRef: {
    fontFamily: "Caveat",
    fontSize: 16,
    color: "#888",
  },
  pcRightSide: {
    position: "absolute",
    right: 20,
    bottom: 40,
    width: "38%",
    gap: 14,
  },
  pcAddressLine: {
    height: 1,
    backgroundColor: "#ccc",
    width: "100%",
  },
  pcFlipHint: {
    marginTop: 12,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },

  // ── Comic Thumbnail ──────────────────────────────────────────────
  comicThumbContainer: {
    flex: 1,
    backgroundColor: "#A8D8EA",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  comicThumbBubble: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#000000",
    padding: 5,
    gap: 3,
    alignItems: "center",
  },
  comicThumbTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#000000",
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  comicThumbCaption: {
    width: "70%",
    backgroundColor: "#FFFACD",
    borderWidth: 1,
    borderColor: "#000000",
    padding: 3,
    marginTop: 4,
    alignItems: "center",
  },
  comicThumbLine: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 1,
  },
  comicThumbLabel: {
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: "center",
  },
  comicThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Comic Full Preview ──────────────────────────────────────────
  comicBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  comicPanel: {
    width: SCREEN_WIDTH - 24,
    backgroundColor: "#A8D8EA",
    borderWidth: 4,
    borderColor: "#000000",
    borderRadius: 6,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
  },
  comicDot: {
    position: "absolute",
    backgroundColor: "#7EC8E3",
    borderRadius: 10,
  },
  comicBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#000000",
    paddingVertical: 24,
    paddingHorizontal: 22,
    width: "100%",
    zIndex: 2,
  },
  comicBubbleText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
    textAlign: "center",
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  comicBubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 22,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#000000",
    alignSelf: "flex-start",
    marginLeft: 40,
    marginTop: -1,
    zIndex: 1,
  },
  comicBubbleTailInner: {
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderTopWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ffffff",
    alignSelf: "flex-start",
    marginLeft: 43,
    marginTop: -25,
    zIndex: 2,
  },
  comicCaption: {
    backgroundColor: "#FFFACD",
    borderWidth: 2.5,
    borderColor: "#000000",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    alignSelf: "flex-end",
  },
  comicCaptionText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
    textAlign: "right",
    letterSpacing: 0.5,
  },
  comicCaptionSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555555",
    textAlign: "right",
    marginTop: 2,
  },

  // ── Sticky Note Thumbnail ─────────────────────────────────────────
  snThumbContainer: {
    flex: 1,
    backgroundColor: "#8B6914",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  snThumbPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D32F2F",
    marginBottom: 3,
    borderWidth: 0.5,
    borderColor: "#B71C1C",
  },
  snThumbNote: {
    width: "80%",
    backgroundColor: "#FFEB3B",
    borderRadius: 2,
    padding: 6,
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  snThumbLine: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 1,
  },
  snThumbLabel: {
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: "center",
  },
  snThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Sticky Note Full Preview ─────────────────────────────────────
  snBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  snBoardContainer: {
    width: SCREEN_WIDTH - 24,
    borderRadius: 8,
    overflow: "hidden",
  },
  snCorkBoard: {
    backgroundColor: "#A0764A",
    paddingVertical: 48,
    paddingHorizontal: 28,
    alignItems: "center",
    minHeight: 420,
    justifyContent: "center",
  },
  snCorkDot: {
    position: "absolute",
    backgroundColor: "#7A5530",
    borderRadius: 3,
  },
  snPinContainer: {
    position: "absolute",
    top: 30,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 10,
  },
  snPinHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D32F2F",
    borderWidth: 1.5,
    borderColor: "#B71C1C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  snPinNeedle: {
    width: 2,
    height: 8,
    backgroundColor: "#888",
    marginTop: -1,
  },
  snNote: {
    width: "100%",
    backgroundColor: "#FFE066",
    borderRadius: 3,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  snRuledLine: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  snVerseText: {
    fontFamily: "Caveat",
    fontSize: 24,
    color: "#2C2C2C",
    lineHeight: 34,
    marginBottom: 16,
  },
  snReference: {
    fontFamily: "Caveat",
    fontSize: 20,
    color: "#555555",
    textAlign: "right",
  },
  snFoldCorner: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    backgroundColor: "#E8C84A",
    borderTopLeftRadius: 12,
  },

  // ── Highway Sign Thumbnail ───────────────────────────────────────
  hwThumbContainer: {
    flex: 1,
    backgroundColor: "#006B54",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  hwThumbShield: {
    width: 28,
    backgroundColor: "#003DA5",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#ffffff",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 4,
  },
  hwThumbShieldBook: {
    fontSize: 4,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
    paddingTop: 2,
  },
  hwThumbShieldRed: {
    width: "100%",
    backgroundColor: "#BF0A30",
    alignItems: "center",
    paddingVertical: 1,
    marginTop: 1,
  },
  hwThumbShieldNum: {
    fontSize: 7,
    fontWeight: "900",
    color: "#ffffff",
  },
  hwThumbLine: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 1,
    alignSelf: "center",
  },
  hwThumbLabel: {
    paddingTop: 6,
    paddingBottom: 2,
    alignItems: "center",
  },
  hwThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Highway Sign Full Preview ────────────────────────────────────
  hwBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  hwSignContainer: {
    width: SCREEN_WIDTH - 24,
    backgroundColor: "#006B54",
    borderRadius: 14,
    padding: 6,
  },
  hwInnerBorder: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  hwShieldRow: {
    alignItems: "center",
    marginBottom: 18,
  },
  hwShieldOuter: {
    width: 100,
    backgroundColor: "#003DA5",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#ffffff",
    alignItems: "center",
    overflow: "hidden",
  },
  hwShieldBlueTop: {
    width: "100%",
    paddingVertical: 5,
    alignItems: "center",
    backgroundColor: "#003DA5",
  },
  hwShieldBookName: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  hwShieldRedBottom: {
    width: "100%",
    backgroundColor: "#BF0A30",
    paddingVertical: 6,
    alignItems: "center",
  },
  hwShieldNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
  },
  hwDestinationMain: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: 0.3,
    paddingHorizontal: 4,
  },
  hwFooterRow: {
    marginTop: 12,
    alignItems: "center",
  },
  hwFooterText: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.5,
  },

  // ── Warning Sign Thumbnail ───────────────────────────────────────
  warnThumbContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#111",
    overflow: "hidden",
  },
  warnThumbBand: {
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: "#333",
  },
  warnThumbBandText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
  },
  warnThumbBody: {
    flex: 1,
    padding: 4,
    gap: 2,
    justifyContent: "center",
  },
  warnThumbLine: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 1,
  },
  warnThumbLabel: {
    paddingTop: 5,
    paddingBottom: 2,
    alignItems: "center",
  },
  warnThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Warning Sign Full Preview ────────────────────────────────────
  warnFullContainer: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  warnBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  warnSign: {
    width: 340,
    borderWidth: 5,
    borderColor: "#111",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  warnBand: {
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#333",
  },
  warnBandTextCol: {
    flex: 1,
  },
  warnBody: {
    backgroundColor: "#ffffff",
    padding: 18,
  },
  warnBookTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  warnChapterVerse: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  warnBodyDivider: {
    height: 1.5,
    backgroundColor: "#111",
    marginVertical: 12,
  },
  warnVerseText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  warnRedLine: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CC0000",
    textAlign: "center",
    letterSpacing: 0.5,
    fontStyle: "italic",
  },

  // ── Revival Poster Thumbnail ────────────────────────────────────
  revThumbContainer: {
    flex: 1,
    backgroundColor: "#f0ede8",
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "#111",
    padding: 5,
    justifyContent: "space-between",
  },
  revThumbTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 0.5,
  },
  revThumbDivider: {
    height: 1,
    backgroundColor: "#111",
    marginVertical: 3,
  },
  revThumbGrid: {
    flexDirection: "row",
    flex: 1,
  },
  revThumbGridDivider: {
    width: 1,
    backgroundColor: "#111",
    marginHorizontal: 3,
  },
  revThumbLineShort: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 1,
  },
  revThumbColorBar: {
    height: 4,
    backgroundColor: "#111",
    marginTop: 3,
    borderRadius: 1,
  },
  revThumbLabel: {
    paddingTop: 5,
    paddingBottom: 2,
    alignItems: "center",
  },
  revThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Revival Poster Full Preview ──────────────────────────────────
  revFullContainer: {
    flex: 1,
    backgroundColor: "#d8d3cc",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  revBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 20,
    padding: 6,
  },
  revCard: {
    width: 340,
    backgroundColor: "#f5f2ed",
    borderWidth: 2.5,
    borderColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  revTitleRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  revTitle: {
    fontSize: 52,
    fontWeight: "900",
    color: "#111",
    letterSpacing: -1,
    lineHeight: 54,
  },
  revHRule: {
    height: 1.5,
    backgroundColor: "#111",
  },
  revInfoRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  revInfoLeft: {
    flex: 1,
    justifyContent: "center",
  },
  revInfoTop: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  revInfoBottom: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.3,
  },
  revInfoVRule: {
    width: 1.5,
    backgroundColor: "#111",
    marginHorizontal: 12,
  },
  revInfoRight: {
    flex: 1,
    justifyContent: "center",
  },
  revFeatLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 1,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  revFeatName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 0.5,
  },
  revColorBarRow: {
    flexDirection: "row",
    height: 10,
  },
  revColorSeg: {
    height: "100%",
  },
  revBottomRow: {
    flexDirection: "row",
    minHeight: 60,
  },
  revVerseBox: {
    flex: 1,
    backgroundColor: "#f5f2ed",
    padding: 10,
    justifyContent: "center",
  },
  revVerseText: {
    fontSize: 11,
    color: "#111",
    lineHeight: 17,
    fontWeight: "500",
  },
  revAccentBox: {
    width: 44,
    backgroundColor: "#B94B3A",
  },
  revIconBox: {
    width: 44,
    borderLeftWidth: 1.5,
    borderLeftColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f2ed",
  },

  // ── App Store Thumbnail ─────────────────────────────────────────
  asThumbContainer: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    borderRadius: 6,
    padding: 6,
    justifyContent: "space-between",
  },
  asThumbTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  asThumbIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  asThumbNameLine: {
    height: 3,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
  },
  asThumbGet: {
    backgroundColor: "#0A84FF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  asThumbGetText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#fff",
  },
  asThumbDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 4,
  },
  asThumbLine: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 1,
  },
  asThumbLabel: {
    paddingTop: 5,
    paddingBottom: 2,
    alignItems: "center",
  },
  asThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── App Store Full Preview ───────────────────────────────────────
  asFullContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  asBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 6,
  },
  asCard: {
    width: 340,
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  asHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  asAppIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  asAppInfo: {
    flex: 1,
    justifyContent: "center",
  },
  asAppName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  asAppDev: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
  },
  asDownloadRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  asBanner: {
    backgroundColor: "#2c2c2e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  asBannerText: {
    fontSize: 13,
    color: "#ebebf5",
    marginBottom: 4,
  },
  asBannerLink: {
    fontSize: 13,
    color: "#0A84FF",
    fontWeight: "600",
  },
  asInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  asInfoCell: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  asInfoDivider: {
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  asInfoLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
  asInfoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  asInfoSub: {
    fontSize: 10,
    color: "#8E8E93",
  },
  asSectionDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 12,
  },
  asWhatsNewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  asWhatsNewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  asVersionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  asVersionText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  asDateText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  asVerseText: {
    fontSize: 14,
    color: "#ebebf5",
    lineHeight: 22,
  },
  asFooter: {
    fontSize: 11,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 4,
  },

  // ── Monopoly Title Deed Thumbnail ───────────────────────────────
  monoThumbContainer: {
    flex: 1,
    backgroundColor: "#f5f0e8",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  monoThumbFrame: {
    flex: 1,
  },
  monoThumbBand: {
    backgroundColor: "#CCCCFF",
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
  },
  monoThumbDeedText: {
    fontSize: 5,
    fontWeight: "700",
    color: "#111",
    letterSpacing: 1,
  },
  monoThumbName: {
    fontSize: 7,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 0.5,
  },
  monoThumbBody: {
    flex: 1,
    padding: 4,
    gap: 3,
    justifyContent: "center",
  },
  monoThumbLine: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 1,
  },
  monoThumbLabel: {
    paddingTop: 5,
    paddingBottom: 2,
    alignItems: "center",
  },
  monoThumbLabelText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Monopoly Title Deed Full Preview ────────────────────────────
  monoFullContainer: {
    flex: 1,
    backgroundColor: "#2a2a3e",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  monoBackButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  monoOuterFrame: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 7,
    borderColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 14,
  },
  monoInnerMat: {
    borderWidth: 2,
    borderColor: "#111",
    margin: 6,
    overflow: "hidden",
  },
  monoColorBand: {
    backgroundColor: "#CCCCFF",
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#111",
    margin: 8,
  },
  monoDeedBox: {
    borderWidth: 1.5,
    borderColor: "#111",
    paddingVertical: 3,
    paddingHorizontal: 16,
    marginBottom: 6,
    backgroundColor: "#CCCCFF",
  },
  monoDeedLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 2.5,
  },
  monoPropertyName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  monoChapterVerse: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginTop: 3,
    letterSpacing: 0.5,
  },
  monoCardBody: {
    backgroundColor: "#ffffff",
    padding: 14,
  },
  monoVerseText: {
    fontSize: 13,
    color: "#111",
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "500",
  },
  monoDivider: {
    height: 1,
    backgroundColor: "#111",
    marginVertical: 10,
  },
  monoDisclaimer: {
    fontSize: 9.5,
    fontStyle: "italic",
    color: "#333",
    textAlign: "left",
    lineHeight: 14,
  },
  monoCopyright: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
