import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { ShareModal } from './ShareModal';
import { favoritesApi } from '../lib/api';
import { useSession } from '../lib/auth-client';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

interface VerseCardProps {
  verse: {
    text: string;
    reference: string;
    version: string;
  };
  backgroundImage: string;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse, backgroundImage }) => {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const viewRef = useRef(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [tempBackgroundImage, setTempBackgroundImage] = useState(backgroundImage);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Helper function to clean verse text by removing ALL bracketed numbers
  const cleanVerseText = (text: string) => {
    return text.replace(/\[\d+\]/g, '').trim();
  };

  const renderStrokedText = (text: string, style: any) => {
    if (strokeEnabled) {
      return (
        <View style={{ position: 'relative' }}>
          {/* Black outline layers */}
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: -3, left: -3 }]}>{text}</Text>
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: -3, left: 0 }]}>{text}</Text>
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: -3, left: 3 }]}>{text}</Text>
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: 0, left: -3 }]}>{text}</Text>
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: 0, left: 3 }]}>{text}</Text>
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: 3, left: -3 }]}>{text}</Text>
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: 3, left: 0 }]}>{text}</Text>
          <Text style={[style, { color: '#000000', position: 'absolute', fontWeight: '900', top: 3, left: 3 }]}>{text}</Text>
          {/* White text on top */}
          <Text style={[style, { color: '#ffffff', fontWeight: '700' }]}>{text}</Text>
        </View>
      );
    }
    return <Text style={[style, { color: '#ffffff', fontWeight: '700' }]}>{text}</Text>;
  };

  // Load bookmark status on mount
  useEffect(() => {
    checkIfBookmarked();
  }, [verse.reference]);

  const checkIfBookmarked = async () => {
    if (!user?.id) return;

    try {
      const favorites = await favoritesApi.getFavorites(user.id);
      const match = verse.reference.match(/^(.+?)\s+(\d+):(\d+)$/);
      if (!match) return;

      const [, book, chapter, verseNum] = match;
      const found = favorites.some(
        (f: any) =>
          f.book === book &&
          f.chapter === parseInt(chapter) &&
          f.verse === parseInt(verseNum),
      );
      setIsBookmarked(found);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user?.id) {
      Alert.alert('Sign In Required', 'Please sign in to bookmark verses');
      return;
    }

    try {
      const match = verse.reference.match(/^(.+?)\s+(\d+):(\d+)$/);
      if (!match) {
        Alert.alert('Error', 'Invalid verse reference format');
        return;
      }

      const [, book, chapter, verseNum] = match;

      if (isBookmarked) {
        // Find the favorite ID first
        const favorites = await favoritesApi.getFavorites(user.id);
        const fav = favorites.find(
          (f: any) =>
            f.book === book &&
            f.chapter === parseInt(chapter) &&
            f.verse === parseInt(verseNum),
        );
        if (fav) {
          await favoritesApi.removeFavorite(fav.id);
        }
        setIsBookmarked(false);
        Alert.alert('Removed', 'Bookmark removed');
      } else {
        await favoritesApi.addFavorite({
          book,
          chapter: parseInt(chapter),
          verse: parseInt(verseNum),
          version: verse.version,
          text: cleanVerseText(verse.text),
        });
        setIsBookmarked(true);
        Alert.alert('Saved', 'Added to bookmarks');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const handleShareClick = () => {
    setShareModalVisible(true);
  };

  const handleDirectSave = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your camera roll');
        return;
      }

      if (!viewRef.current) {
        console.error('❌ View ref is null');
        return;
      }

      console.log('💾 Capturing verse card for direct save');
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      
      console.log('✅ Captured image:', uri);

      // Save to camera roll
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Image saved to camera roll!');
      
    } catch (error) {
      console.error('❌ Error saving:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleShare = async (
    imageUrl: string | null, 
    stroke: boolean = true, 
    position: { x: number; y: number } = { x: 0, y: 0 },
    overlay: boolean = false
  ) => {
    setIsSharing(true);
    setImageLoaded(false);
    
    // Apply customization settings
    setStrokeEnabled(stroke);
    setTextPosition(position);
    setOverlayEnabled(overlay);
    
    // If imageUrl is null, use current background
    // Otherwise, use the selected image
    const imageToUse = imageUrl === null ? backgroundImage : imageUrl;
    
    // Temporarily update the background
    setTempBackgroundImage(imageToUse);
    
    // Wait for stroke layers to render
    console.log('⏱️ Waiting for text stroke layers to render...');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Wait for image to load if there is one
    if (imageToUse) {
      console.log('📸 Waiting for image to load before sharing...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Additional wait if image hasn't loaded yet
      if (!imageLoaded) {
        console.warn('⚠️ Image not loaded yet, waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      // Just a short delay for black background
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      if (!viewRef.current) {
        console.error('❌ View ref is null');
        return;
      }

      console.log('📸 Capturing verse card with background:', imageToUse || 'black');
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      
      console.log('✅ Captured image:', uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Verse',
        });
      } else {
        Alert.alert('Sharing not available');
      }
    } catch (error) {
      console.error('❌ Error sharing:', error);
      Alert.alert('Error', 'Failed to share image');
    } finally {
      // Reset to original background
      setTempBackgroundImage(backgroundImage);
      setImageLoaded(false);
      setIsSharing(false);
    }
  };

  const handleSave = async (
    imageUrl: string | null, 
    stroke: boolean = true, 
    position: { x: number; y: number } = { x: 0, y: 0 },
    overlay: boolean = false
  ) => {
    setIsSharing(true);
    setImageLoaded(false);
    
    // Apply customization settings
    setStrokeEnabled(stroke);
    setTextPosition(position);
    setOverlayEnabled(overlay);
    
    // If imageUrl is null, use current background
    // Otherwise, use the selected image
    const imageToUse = imageUrl === null ? backgroundImage : imageUrl;
    
    // Temporarily update the background
    setTempBackgroundImage(imageToUse);
    
    // Wait for stroke layers to render
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Wait for image to load if there is one
    if (imageToUse) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!imageLoaded) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your camera roll');
        return;
      }

      if (!viewRef.current) {
        console.error('❌ View ref is null');
        return;
      }

      console.log('💾 Capturing verse card for save:', imageToUse || 'black');
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      
      console.log('✅ Captured image:', uri);

      // Save to camera roll
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Image saved to camera roll!');
      
    } catch (error) {
      console.error('❌ Error saving:', error);
      Alert.alert('Error', 'Failed to save image');
    } finally {
      // Reset to original background
      setTempBackgroundImage(backgroundImage);
      setImageLoaded(false);
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View ref={viewRef} style={styles.card} collapsable={false}>
        {tempBackgroundImage ? (
          <>
            <Image
              source={{ uri: tempBackgroundImage }}
              style={styles.backgroundImage}
              resizeMode="cover"
              onLoad={() => {
                console.log('✅ Background image loaded in VerseCard');
                setImageLoaded(true);
              }}
              onError={(error) => {
                console.error('❌ Background image failed to load:', error);
                setImageLoaded(false);
              }}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            >
              <View style={[styles.content, { transform: [{ translateX: textPosition.x }, { translateY: textPosition.y }] }]}>
                {renderStrokedText(`"${cleanVerseText(verse.text)}"`, styles.verseText)}
                {renderStrokedText(verse.reference, styles.reference)}
              </View>
            </LinearGradient>
          </>
        ) : (
          <View style={styles.blackBackground}>
            <View style={[styles.content, { transform: [{ translateX: textPosition.x }, { translateY: textPosition.y }] }]}>
              {renderStrokedText(`"${cleanVerseText(verse.text)}"`, styles.verseText)}
              {renderStrokedText(verse.reference, styles.reference)}
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShareClick}>
          <Ionicons name="share-social-outline" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDirectSave}>
          <Ionicons name="download-outline" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleBookmarkToggle}>
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked ? "#fbbf24" : "#ffffff"} 
          />
          <Text style={[styles.actionText, isBookmarked && styles.bookmarkedText]}>
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Text>
        </TouchableOpacity>
      </View>

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShare}
        onSave={handleSave}
        currentImage={tempBackgroundImage}
        verse={{
          text: verse.text,
          reference: verse.reference,
        }}
        version={verse.version}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  card: {
    width: width - 32,
    height: (width - 32) * 16 / 9,  // 9:16 aspect ratio for vertical format
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  blackBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  verseText: {
    fontSize: 22,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 20,
  },
  reference: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  bookmarkedText: {
    color: '#fbbf24',
  },
});
