import AsyncStorage from "@react-native-async-storage/async-storage";

const BIBLE_VERSION_KEY = "@bible_version";
const PLAYBACK_SPEED_KEY = "@playback_speed";
const DEFAULT_VERSION = "WEB";
const DEFAULT_PLAYBACK_SPEED = 1.0;

export const BibleVersionStorage = {
  async getVersion(): Promise<string> {
    try {
      const version = await AsyncStorage.getItem(BIBLE_VERSION_KEY);
      return version ?? DEFAULT_VERSION;
    } catch (error) {
      console.error("Error getting Bible version:", error);
      return DEFAULT_VERSION;
    }
  },

  async setVersion(version: string): Promise<void> {
    try {
      await AsyncStorage.setItem(BIBLE_VERSION_KEY, version);
    } catch (error) {
      console.error("Error saving Bible version:", error);
    }
  },

  async getPlaybackSpeed(): Promise<number> {
    try {
      const speed = await AsyncStorage.getItem(PLAYBACK_SPEED_KEY);
      return speed ? parseFloat(speed) : DEFAULT_PLAYBACK_SPEED;
    } catch (error) {
      console.error("Error getting playback speed:", error);
      return DEFAULT_PLAYBACK_SPEED;
    }
  },

  async setPlaybackSpeed(speed: number): Promise<void> {
    try {
      await AsyncStorage.setItem(PLAYBACK_SPEED_KEY, speed.toString());
    } catch (error) {
      console.error("Error saving playback speed:", error);
    }
  },
};
