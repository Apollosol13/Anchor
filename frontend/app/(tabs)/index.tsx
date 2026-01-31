import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { VerseCard } from '../../src/components/VerseCard';
import { ImageSelector } from '../../src/components/ImageSelector';
import { verseApi, imageApi } from '../../src/lib/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [verse, setVerse] = useState<any>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const verseResponse = await verseApi.getVerseOfTheDay();
      setVerse(verseResponse.data);

      const presetResponse = await imageApi.getRandomPreset();
      if (presetResponse.data?.image_url) {
        setBackgroundImage(presetResponse.data.image_url);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading verse of the day...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
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

        {verse && (
          <VerseCard
            verse={verse}
            backgroundImage={backgroundImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'}
          />
        )}

        <View style={styles.selectorContainer}>
          <ImageSelector
            onImageSelect={setBackgroundImage}
            currentImage={backgroundImage}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#9ca3af',
    marginBottom: 24,
  },
  selectorContainer: {
    marginTop: 24,
  },
});
