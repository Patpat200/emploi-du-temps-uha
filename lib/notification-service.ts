/**
 * Service de gestion des notifications et de l'expiration du statut modifié
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const MODIFIED_EVENTS_KEY = '@emploi_du_temps_modified_events';
const MODIFICATION_TIMESTAMP_KEY = '@emploi_du_temps_modification_timestamp';

// Durée d'affichage du statut "modifié" en millisecondes (1 heure)
const MODIFICATION_EXPIRY_TIME = 60 * 60 * 1000; // 1 heure

export interface ModifiedEventNotification {
  eventId: string;
  title: string;
  changeType: 'created' | 'modified' | 'cancelled';
  changeDetails: string;
  timestamp: number;
}

/**
 * Initialise le service de notifications
 */
export async function initNotificationService(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[NOTIFICATIONS] Service désactivé sur web');
    return;
  }

  try {
    // Demander les permissions
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('[NOTIFICATIONS] Permissions refusées');
      return;
    }

    // Configurer le comportement des notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    console.log('[NOTIFICATIONS] Service initialisé');
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors de l\'initialisation:', error);
  }
}

/**
 * Enregistre un événement modifié
 */
export async function recordModifiedEvent(
  eventId: string,
  title: string,
  changeType: 'created' | 'modified' | 'cancelled',
  changeDetails: string
): Promise<void> {
  try {
    const now = Date.now();
    
    // Récupérer les événements modifiés existants
    const existingJson = await AsyncStorage.getItem(MODIFIED_EVENTS_KEY);
    const existing: ModifiedEventNotification[] = existingJson ? JSON.parse(existingJson) : [];
    
    // Ajouter le nouvel événement
    const notification: ModifiedEventNotification = {
      eventId,
      title,
      changeType,
      changeDetails,
      timestamp: now,
    };
    
    existing.push(notification);
    
    // Sauvegarder
    await AsyncStorage.setItem(MODIFIED_EVENTS_KEY, JSON.stringify(existing));
    await AsyncStorage.setItem(MODIFICATION_TIMESTAMP_KEY, now.toString());
    
    console.log('[NOTIFICATIONS] Événement enregistré:', eventId);
    
    // Envoyer une notification
    await sendNotification(title, changeDetails, changeType);
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors de l\'enregistrement:', error);
  }
}

/**
 * Envoie une notification à l'utilisateur
 */
async function sendNotification(
  title: string,
  body: string,
  changeType: 'created' | 'modified' | 'cancelled'
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const emoji = {
      created: '✨',
      modified: '📝',
      cancelled: '❌',
    }[changeType];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} ${title}`,
        body,
        data: { changeType },
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Immédiat
    });

    console.log('[NOTIFICATIONS] Notification envoyée');
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors de l\'envoi:', error);
  }
}

/**
 * Récupère les événements modifiés non expirés
 */
export async function getActiveModifiedEvents(): Promise<ModifiedEventNotification[]> {
  try {
    const json = await AsyncStorage.getItem(MODIFIED_EVENTS_KEY);
    if (!json) {
      return [];
    }

    const events: ModifiedEventNotification[] = JSON.parse(json);
    const now = Date.now();

    // Filtrer les événements non expirés
    const active = events.filter(
      event => (now - event.timestamp) < MODIFICATION_EXPIRY_TIME
    );

    return active;
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors de la récupération:', error);
    return [];
  }
}

/**
 * Vérifie si un événement est modifié et non expiré
 */
export async function isEventModified(eventId: string): Promise<boolean> {
  const active = await getActiveModifiedEvents();
  return active.some(e => e.eventId === eventId);
}

/**
 * Récupère le temps restant avant expiration du statut modifié pour un événement
 */
export async function getModificationTimeRemaining(eventId: string): Promise<number> {
  try {
    const json = await AsyncStorage.getItem(MODIFIED_EVENTS_KEY);
    if (!json) {
      return 0;
    }

    const events: ModifiedEventNotification[] = JSON.parse(json);
    const event = events.find(e => e.eventId === eventId);
    
    if (!event) {
      return 0;
    }

    const now = Date.now();
    const remaining = MODIFICATION_EXPIRY_TIME - (now - event.timestamp);
    
    return Math.max(0, remaining);
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur:', error);
    return 0;
  }
}

/**
 * Nettoie les événements modifiés expirés
 */
export async function cleanupExpiredModifications(): Promise<void> {
  try {
    const json = await AsyncStorage.getItem(MODIFIED_EVENTS_KEY);
    if (!json) {
      return;
    }

    const events: ModifiedEventNotification[] = JSON.parse(json);
    const now = Date.now();

    // Filtrer les événements non expirés
    const active = events.filter(
      event => (now - event.timestamp) < MODIFICATION_EXPIRY_TIME
    );

    if (active.length < events.length) {
      console.log('[NOTIFICATIONS] Nettoyage:', events.length - active.length, 'événements expirés');
      await AsyncStorage.setItem(MODIFIED_EVENTS_KEY, JSON.stringify(active));
    }
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors du nettoyage:', error);
  }
}

/**
 * Réinitialise tous les événements modifiés
 */
export async function resetModifiedEvents(): Promise<void> {
  try {
    await AsyncStorage.removeItem(MODIFIED_EVENTS_KEY);
    await AsyncStorage.removeItem(MODIFICATION_TIMESTAMP_KEY);
    console.log('[NOTIFICATIONS] Événements modifiés réinitialisés');
  } catch (error) {
    console.error('[NOTIFICATIONS] Erreur lors de la réinitialisation:', error);
  }
}

/**
 * Formate le temps restant en texte lisible
 */
export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
