import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { imageApi } from '../lib/api';
import { supabase } from '../lib/supabase';

interface ImageSelectorProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  onImageSelect,
  currentImage,
}) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'nature', 'abstract', 'minimalist', 'sunset', 'ocean', 'mountains'];

  useEffect(() => {
    fetchPresets();
  }, [category]);

  const fetchPresets = async () => {
    setLoading(true);
    try {
      const response = await imageApi.getPresets(category === 'all' ? undefined : category);
      setPresets(response.data || []);
    } catch (error) {
      console.error('Error fetching presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const fileName = `${Date.now()}.jpg`;
        
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from('user-uploads')
          .upload(fileName, blob);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(fileName);

        onImageSelect(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Background</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                category === cat && styles.categoryTextActive,
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetsScroll}
          contentContainerStyle={styles.presetsContainer}
        >
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetCard,
                currentImage === preset.image_url && styles.presetCardSelected,
              ]}
              onPress={() => onImageSelect(preset.image_url)}
            >
              <Image
                source={{ uri: preset.image_url }}
                style={styles.presetImage}
                resizeMode="cover"
              />
              {currentImage === preset.image_url && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#000000" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={handleCustomUpload}>
        <Ionicons name="cloud-upload-outline" size={24} color="#ffffff" />
        <Text style={styles.uploadText}>Upload Your Own</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#ffffff',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingRight: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  categoryButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  categoryTextActive: {
    color: '#000000',
  },
  loader: {
    marginVertical: 32,
  },
  presetsScroll: {
    marginBottom: 16,
  },
  presetsContainer: {
    paddingRight: 16,
    gap: 12,
  },
  presetCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  presetCardSelected: {
    borderColor: '#ffffff',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#3a3a3a',
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
