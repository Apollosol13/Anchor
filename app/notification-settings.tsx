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
  Modal,
  FlatList,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService, NotificationPreferences } from '@/lib/notifications';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

export default function NotificationSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dailyVerseEnabled: true,
    dailyVerseTime: '09:00',
    readingStreakEnabled: true,
    chapterCompletionEnabled: false,
  });
  const [pending, setPending] = useState<NotificationPreferences | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Time picker state
  const [pickerHour, setPickerHour] = useState('9');
  const [pickerMinute, setPickerMinute] = useState('00');
  const [pickerPeriod, setPickerPeriod] = useState('AM');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const prefs = await notificationService.getNotificationPreferences();
      if (prefs) {
        setPreferences(prefs);
        setPending(prefs);
        syncPickerFromTime(prefs.dailyVerseTime);
      }
    } catch (error) {
      console.error('❌ Error loading notification preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const syncPickerFromTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    setPickerHour(String(hour12));
    setPickerMinute(String(m).padStart(2, '0'));
    setPickerPeriod(period);
  };

  const applyPickerTime = () => {
    let h = parseInt(pickerHour, 10);
    if (pickerPeriod === 'PM' && h !== 12) h += 12;
    if (pickerPeriod === 'AM' && h === 12) h = 0;
    const timeString = `${String(h).padStart(2, '0')}:${pickerMinute}`;
    setPending((prev: NotificationPreferences | null) =>
      prev ? { ...prev, dailyVerseTime: timeString } : { ...preferences, dailyVerseTime: timeString }
    );
    setShowTimePicker(false);
  };

  const current = pending ?? preferences;
  const hasChanges = JSON.stringify(pending) !== JSON.stringify(preferences);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPending((prev: NotificationPreferences | null) =>
      prev
        ? { ...prev, [key]: !prev[key] }
        : { ...preferences, [key]: !(preferences[key as keyof NotificationPreferences]) }
    );
  };

  const handleSave = async () => {
    if (!pending) return;
    setSaving(true);
    try {
      const success = await notificationService.saveNotificationPreferences(pending);
      if (success) {
        setPreferences(pending);
        Alert.alert('Saved', 'Notification preferences updated.');
      } else {
        Alert.alert('Error', 'Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving notification preferences:', error);
      Alert.alert('Error', 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };


  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Notifications',
            headerStyle: { backgroundColor: '#000000' },
            headerTintColor: '#ffffff',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
        }}
      />

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              {/* Hour */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <FlatList
                  data={HOURS}
                  keyExtractor={item => item}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, pickerHour === item && styles.pickerItemSelected]}
                      onPress={() => setPickerHour(item)}
                    >
                      <Text style={[styles.pickerItemText, pickerHour === item && styles.pickerItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Minute */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Min</Text>
                <FlatList
                  data={MINUTES}
                  keyExtractor={item => item}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, pickerMinute === item && styles.pickerItemSelected]}
                      onPress={() => setPickerMinute(item)}
                    >
                      <Text style={[styles.pickerItemText, pickerMinute === item && styles.pickerItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* AM/PM */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerLabel}>Period</Text>
                {PERIODS.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.pickerItem, pickerPeriod === p && styles.pickerItemSelected]}
                    onPress={() => setPickerPeriod(p)}
                  >
                    <Text style={[styles.pickerItemText, pickerPeriod === p && styles.pickerItemTextSelected]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={applyPickerTime}>
              <Text style={styles.confirmButtonText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

        {/* Daily Verse Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Verse</Text>
          <Text style={styles.sectionDescription}>
            Receive a daily verse notification to start your day with inspiration
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="book-outline" size={24} color="#ffffff" />
              <Text style={styles.settingText}>Daily Verse Reminder</Text>
            </View>
            <Switch
              value={current.dailyVerseEnabled}
              onValueChange={() => handleToggle('dailyVerseEnabled')}
              trackColor={{ false: '#767577', true: '#34d399' }}
              thumbColor={current.dailyVerseEnabled ? '#ffffff' : '#f4f3f4'}
              disabled={saving}
            />
          </View>

          {current.dailyVerseEnabled && (
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => {
                syncPickerFromTime(current.dailyVerseTime);
                setShowTimePicker(true);
              }}
              disabled={saving}
            >
              <Text style={styles.timeSelectorLabel}>Reminder Time</Text>
              <View style={styles.timeSelectorValue}>
                <Text style={styles.timeSelectorText}>{formatTime(current.dailyVerseTime)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Reading Streak Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Streak</Text>
          <Text style={styles.sectionDescription}>
            Get reminded to keep your reading streak alive
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flame-outline" size={24} color="#ffffff" />
              <Text style={styles.settingText}>Streak Reminders</Text>
            </View>
            <Switch
              value={current.readingStreakEnabled}
              onValueChange={() => handleToggle('readingStreakEnabled')}
              trackColor={{ false: '#767577', true: '#34d399' }}
              thumbColor={current.readingStreakEnabled ? '#ffffff' : '#f4f3f4'}
              disabled={saving}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>
            Make sure notifications are enabled in your device settings for these to work.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={[styles.saveButtonText, (!hasChanges || saving) && styles.saveButtonTextDisabled]}>
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </Text>
          )}
        </TouchableOpacity>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 60,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginTop: 12,
  },
  timeSelectorLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  timeSelectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSelectorText: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 8,
    fontWeight: '500',
  },
  infoSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#0a0a0a',
    marginTop: 24,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 12,
    lineHeight: 18,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#34d399',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  saveButtonTextDisabled: {
    color: '#4b5563',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pickerCol: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerList: {
    maxHeight: 200,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#34d399',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  confirmButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#34d399',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
