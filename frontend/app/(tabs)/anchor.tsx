import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AnchorScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="anchor" size={80} color="#ffffff" />
        </View>
        
        <Text style={styles.title}>Anchor Bible</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.text}>
            Share beautiful Bible verses with stunning imagery. Multiple Bible versions,
            AI-powered explanations, and a beautiful interface to help you engage with
            God's Word daily.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.text}>• Daily verse with beautiful backgrounds</Text>
          <Text style={styles.text}>• Browse the entire Bible</Text>
          <Text style={styles.text}>• Bookmark your favorite verses</Text>
          <Text style={styles.text}>• Multiple Bible translations</Text>
          <Text style={styles.text}>• Share verses as images</Text>
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
  content: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
    marginBottom: 8,
  },
});
