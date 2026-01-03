/**
 * Service de synchronisation pour télécharger et mettre à jour l'emploi du temps
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseICS, type CourseEvent } from './ics-parser';

const STORAGE_KEY = '@emploi_du_temps_events';
const LAST_SYNC_KEY = '@emploi_du_temps_last_sync';
const ICS_URL_KEY = '@emploi_du_temps_ics_url';

// URL par défaut fournie par l'utilisateur
const DEFAULT_ICS_URL = 'https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=60dc6b2fb1eac2554ee1103516dc50b4e04e91d0526fa823618ff6fa9e7d7198dd65eb4f5911f810ef6a36d3b58d61bf314d669fae9ca422200cb711a9b76537,1';

export interface SyncResult {
  success: boolean;
  events: CourseEvent[];
  lastSync: Date;
  error?: string;
}

/**
 * Récupère l'URL du flux ICS depuis le stockage
 */
export async function getICSUrl(): Promise<string> {
  try {
    const url = await AsyncStorage.getItem(ICS_URL_KEY);
    return url || DEFAULT_ICS_URL;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL ICS:', error);
    return DEFAULT_ICS_URL;
  }
}

/**
 * Enregistre l'URL du flux ICS
 */
export async function setICSUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ICS_URL_KEY, url);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'URL ICS:', error);
  }
}

/**
 * Télécharge le fichier ICS depuis l'URL
 */
async function downloadICS(url: string): Promise<string> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/calendar',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return await response.text();
}

/**
 * Sauvegarde les événements dans le stockage local
 */
async function saveEvents(events: CourseEvent[]): Promise<void> {
  try {
    const jsonData = JSON.stringify(events);
    await AsyncStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des événements:', error);
    throw error;
  }
}

/**
 * Charge les événements depuis le stockage local
 */
export async function loadEvents(): Promise<CourseEvent[]> {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (!jsonData) {
      return [];
    }
    
    const events = JSON.parse(jsonData);
    
    // Reconvertir les dates en objets Date
    return events.map((event: any) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      lastModified: new Date(event.lastModified),
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error);
    return [];
  }
}

/**
 * Récupère la date de dernière synchronisation
 */
export async function getLastSyncDate(): Promise<Date | null> {
  try {
    const dateStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return dateStr ? new Date(dateStr) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la date de sync:', error);
    return null;
  }
}

/**
 * Enregistre la date de dernière synchronisation
 */
async function setLastSyncDate(date: Date): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, date.toISOString());
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la date de sync:', error);
  }
}

/**
 * Synchronise l'emploi du temps depuis l'URL
 */
export async function syncSchedule(): Promise<SyncResult> {
  try {
    const url = await getICSUrl();
    
    // Télécharger le fichier ICS
    const icsContent = await downloadICS(url);
    
    // Parser le contenu
    const events = parseICS(icsContent);
    
    if (events.length === 0) {
      throw new Error('Aucun événement trouvé dans le fichier ICS');
    }
    
    // Charger les événements précédents pour détecter les modifications
    const previousEvents = await loadEvents();
    const modifiedEvents = detectModifications(previousEvents, events);
    
    // Sauvegarder les nouveaux événements
    await saveEvents(modifiedEvents);
    
    // Mettre à jour la date de dernière sync
    const now = new Date();
    await setLastSyncDate(now);
    
    return {
      success: true,
      events: modifiedEvents,
      lastSync: now,
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    
    // En cas d'erreur, retourner les événements en cache
    const cachedEvents = await loadEvents();
    const lastSync = await getLastSyncDate();
    
    return {
      success: false,
      events: cachedEvents,
      lastSync: lastSync || new Date(),
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Détecte les modifications entre deux listes d'événements
 */
function detectModifications(
  previousEvents: CourseEvent[],
  newEvents: CourseEvent[]
): CourseEvent[] {
  const previousMap = new Map(previousEvents.map(e => [e.id, e]));
  
  return newEvents.map(newEvent => {
    const previousEvent = previousMap.get(newEvent.id);
    
    if (!previousEvent) {
      // Nouvel événement
      return newEvent;
    }
    
    // Vérifier si l'événement a été modifié
    const isModified =
      previousEvent.title !== newEvent.title ||
      previousEvent.startTime.getTime() !== newEvent.startTime.getTime() ||
      previousEvent.endTime.getTime() !== newEvent.endTime.getTime() ||
      previousEvent.location !== newEvent.location ||
      previousEvent.lastModified.getTime() !== newEvent.lastModified.getTime();
    
    if (isModified) {
      return {
        ...newEvent,
        status: 'modified' as const,
      };
    }
    
    return newEvent;
  });
}

/**
 * Initialise le service de synchronisation
 */
export async function initSyncService(): Promise<void> {
  // Charger les événements en cache au démarrage
  const events = await loadEvents();
  
  if (events.length === 0) {
    // Première utilisation, synchroniser immédiatement
    await syncSchedule();
  }
}
