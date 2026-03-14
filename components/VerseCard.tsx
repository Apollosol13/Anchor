import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useRef } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

const { width } = Dimensions.get("window");

interface VerseCardProps {
  verse: {
    text: string;
    reference: string;
    version: string;
  };
  backgroundImage: string;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  backgroundImage,
}) => {
  const viewRef = useRef(null);

  const handleShare = async () => {
    try {
      if (!viewRef.current) return;

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sharing not available");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share image");
    }
  };

  const handleDownload = async () => {
    try {
      if (!viewRef.current) return;

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });

      const filename =
        FileSystem.documentDirectory +
        `${verse.reference.replace(/[: ]/g, "-")}.png`;
      await FileSystem.moveAsync({
        from: uri,
        to: filename,
      });

      Alert.alert("Success", "Image saved!");
    } catch (error) {
      console.error("Error downloading:", error);
      Alert.alert("Error", "Failed to save image");
    }
  };

  return (
    <View style={styles.container}>
      <View ref={viewRef} style={styles.card} collapsable={false}>
        <Image
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.gradient}>
          <View style={styles.content}>
            <Text style={styles.verseText}>"{verse.text}"</Text>
            <Text style={styles.reference}>
              {verse.reference} ({verse.version})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Bookmark</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 16,
  },
  card: {
    width: width - 32,
    height: width - 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    experimental_backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7))",
  },
  content: {
    alignItems: "center",
  },
  verseText: {
    fontSize: 22,
    fontWeight: "300",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 20,
  },
  reference: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
});
