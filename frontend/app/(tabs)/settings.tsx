import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [defaultVersion, setDefaultVersion] = useState('ESV');

  const versions = ['ESV', 'KJV', 'NIV', 'NLT', 'NKJV'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Bible Version */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bible Version</Text>
          {versions.map((version) => (
            <TouchableOpacity
              key={version}
              style={styles.settingRow}
              onPress={() => setDefaultVersion(version)}
            >
              <Text style={styles.settingText}>{version}</Text>
              {defaultVersion === version && (
                <Ionicons name="checkmark" size={24} color="#ffffff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Daily Verse Reminder</Text>
              <Text style={styles.settingDescription}>
                Get notified of the verse of the day
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#3a3a3a', true: '#4b5563' }}
              thumbColor={notifications ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Download */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloads</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Auto-save Images</Text>
              <Text style={styles.settingDescription}>
                Automatically save created verse images
              </Text>
            </View>
            <Switch
              value={autoDownload}
              onValueChange={setAutoDownload}
              trackColor={{ false: '#3a3a3a', true: '#4b5563' }}
              thumbColor={autoDownload ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  versionText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
