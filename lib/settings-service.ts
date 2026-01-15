/**
 * Service de gestion des paramètres de l'application
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_SYNC_KEY = '@emploi_du_temps_auto_sync';
const SYNC_INTERVAL_KEY = '@emploi_du_temps_sync_interval';
const NOTIFICATIONS_KEY = '@emploi_du_temps_notifications';

export interface AppSettings {
  autoSync: boolean;
  syncInterval: number; // en minutes
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSync: true,
  syncInterval: 15, // 15 minutes par défaut
  notificationsEnabled: false,
};

/**
 * Récupère les paramètres de l'application
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const [autoSyncStr, syncIntervalStr, notificationsStr] = await Promise.all([
      AsyncStorage.getItem(AUTO_SYNC_KEY),
      AsyncStorage.getItem(SYNC_INTERVAL_KEY),
      AsyncStorage.getItem(NOTIFICATIONS_KEY),
    ]);

    return {
      autoSync: autoSyncStr !== null ? JSON.parse(autoSyncStr) : DEFAULT_SETTINGS.autoSync,
      syncInterval: syncIntervalStr !== null ? parseInt(syncIntervalStr, 10) : DEFAULT_SETTINGS.syncInterval,
      notificationsEnabled: notificationsStr !== null ? JSON.parse(notificationsStr) : DEFAULT_SETTINGS.notificationsEnabled,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Enregistre les paramètres de l'application
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const promises = [];

    if (settings.autoSync !== undefined) {
      promises.push(AsyncStorage.setItem(AUTO_SYNC_KEY, JSON.stringify(settings.autoSync)));
    }

    if (settings.syncInterval !== undefined) {
      promises.push(AsyncStorage.setItem(SYNC_INTERVAL_KEY, settings.syncInterval.toString()));
    }

    if (settings.notificationsEnabled !== undefined) {
      promises.push(AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(settings.notificationsEnabled)));
    }

    await Promise.all(promises);
    console.log('[SETTINGS] Paramètres enregistrés:', settings);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des paramètres:', error);
  }
}

/**
 * Réinitialise les paramètres aux valeurs par défaut
 */
export async function resetSettings(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(AUTO_SYNC_KEY),
      AsyncStorage.removeItem(SYNC_INTERVAL_KEY),
      AsyncStorage.removeItem(NOTIFICATIONS_KEY),
    ]);
    console.log('[SETTINGS] Paramètres réinitialisés');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error);
  }
}
