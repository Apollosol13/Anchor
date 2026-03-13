import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut, useSession } from '@/lib/auth-client';
import { notificationApi } from '@/lib/api';

const VERSIONS = ['WEB', 'KJV', 'ASV', 'FBV', 'NLT'];

const TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '18:00', '20:00', '21:00',
];

function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
}

export default function SettingsScreen() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultVersion, setDefaultVersion] = useState('WEB');

  // Notification prefs
  const [dailyVerseEnabled, setDailyVerseEnabled] = useState(true);
  const [dailyVerseTime, setDailyVerseTime] = useState('09:00');
  const [streakEnabled, setStreakEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationApi.getPreferences();
      setDailyVerseEnabled(prefs.dailyVerseEnabled ?? true);
      setDailyVerseTime(prefs.dailyVerseTime ?? '09:00');
      setStreakEnabled(prefs.readingStreakEnabled ?? true);
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await notificationApi.updatePreferences({
        dailyVerseEnabled,
        dailyVerseTime,
        readingStreakEnabled: streakEnabled,
        timezone,
        ...updates,
      });
    } catch (err) {
      console.error('Failed to save preferences:', err);
      Alert.alert('Error', 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleDailyVerseToggle = (value: boolean) => {
    setDailyVerseEnabled(value);
    savePreferences({ dailyVerseEnabled: value });
  };

  const handleStreakToggle = (value: boolean) => {
    setStreakEnabled(value);
    savePreferences({ readingStreakEnabled: value });
  };

  const handleTimeSelect = (time: string) => {
    setDailyVerseTime(time);
    setShowTimePicker(false);
    savePreferences({ dailyVerseTime: time });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Account */}
        {session && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>{session.user.name}</Text>
                <Text style={styles.settingDescription}>{session.user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Bible Version */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bible Version</Text>
          {VERSIONS.map((version) => (
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
          {loading ? (
            <ActivityIndicator color="#ffffff" style={{ marginVertical: 16 }} />
          ) : (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Daily Verse</Text>
                  <Text style={styles.settingDescription}>
                    Receive your daily verse notification
                  </Text>
                </View>
                <Switch
                  value={dailyVerseEnabled}
                  onValueChange={handleDailyVerseToggle}
                  trackColor={{ false: '#3a3a3a', true: '#4b5563' }}
                  thumbColor={dailyVerseEnabled ? '#ffffff' : '#9ca3af'}
                />
              </View>

              {dailyVerseEnabled && (
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                >
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Delivery Time</Text>
                    <Text style={styles.settingDescription}>
                      {formatTime(dailyVerseTime)}
                    </Text>
                  </View>
                  <Ionicons
                    name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              )}

              {showTimePicker && (
                <View style={styles.timePickerContainer}>
                  {TIMES.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        dailyVerseTime === time && styles.timeOptionActive,
                      ]}
                      onPress={() => handleTimeSelect(time)}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          dailyVerseTime === time && styles.timeOptionTextActive,
                        ]}
                      >
                        {formatTime(time)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Streak Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Daily reminder at 8 PM to keep your reading streak
                  </Text>
                </View>
                <Switch
                  value={streakEnabled}
                  onValueChange={handleStreakToggle}
                  trackColor={{ false: '#3a3a3a', true: '#4b5563' }}
                  thumbColor={streakEnabled ? '#ffffff' : '#9ca3af'}
                />
              </View>
            </>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(marketing)/privacy')}
          >
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/(marketing)/terms')}
          >
            <Text style={styles.settingText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingBottom: 48,
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
  timePickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  timeOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  timeOptionActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  timeOptionTextActive: {
    color: '#000000',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
