import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { BibleVersionStorage } from '@/lib/storage';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [defaultVersion, setDefaultVersion] = useState('WEB');

  const versions = ['WEB', 'KJV', 'ASV', 'FBV', 'NLT'];

  useEffect(() => {
    BibleVersionStorage.getVersion()
      .then(setDefaultVersion)
      .catch(() => {});
  }, []);

  const handleVersionSelect = async (version: string) => {
    setDefaultVersion(version);
    await BibleVersionStorage.setVersion(version);
    Alert.alert(
      'Bible Version Updated',
      `Preferred version set to ${version}.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Bible Version */}
        <Text style={styles.sectionHeader}>BIBLE VERSION</Text>
        <Text style={styles.sectionDescription}>
          Choose your preferred Bible translation for reading and verse of the day
        </Text>
        <View style={styles.group}>
          {versions.map((version, index) => (
            <React.Fragment key={version}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleVersionSelect(version)}
                activeOpacity={0.7}
              >
                <Text style={styles.rowLabel}>{version}</Text>
                {defaultVersion === version && (
                  <Ionicons name="checkmark" size={20} color="#34d399" />
                )}
              </TouchableOpacity>
              {index < versions.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowTextBlock}>
              <Text style={styles.rowLabel}>Daily Verse Reminder</Text>
              <Text style={styles.rowSub}>Get notified of the verse of the day</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#3a3a3a', true: '#34d399' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Downloads */}
        <Text style={styles.sectionHeader}>DOWNLOADS</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowTextBlock}>
              <Text style={styles.rowLabel}>Auto-save Images</Text>
              <Text style={styles.rowSub}>Automatically save created verse images</Text>
            </View>
            <Switch
              value={autoDownload}
              onValueChange={setAutoDownload}
              trackColor={{ false: '#3a3a3a', true: '#34d399' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Display */}
        <Text style={styles.sectionHeader}>DISPLAY</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <View style={styles.rowTextBlock}>
              <Text style={styles.rowLabel}>Font Size</Text>
              <Text style={styles.rowSub}>Medium</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 28,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  group: {
    backgroundColor: '#111111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  rowSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    color: '#6b7280',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2a2a2a',
    marginLeft: 16,
  },
});
