import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { getSettings, saveSettings } from './settings-service';

// Cache mémoire — évite de lire AsyncStorage à chaque toucher
let _enabled = true;
let _initialized = false;

export async function initHaptics(): Promise<void> {
  const settings = await getSettings();
  _enabled = settings.hapticsEnabled;
  _initialized = true;
}

export function setHapticsEnabled(value: boolean): void {
  _enabled = value;
}

export function impact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light): void {
  if (!_enabled || Platform.OS === 'web') return;
  Haptics.impactAsync(style);
}

export function notification(type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success): void {
  if (!_enabled || Platform.OS === 'web') return;
  Haptics.notificationAsync(type);
}
