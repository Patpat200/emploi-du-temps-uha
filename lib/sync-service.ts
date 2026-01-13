/**
 * Service de synchronisation pour télécharger et mettre à jour l'emploi du temps
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseICS, type CourseEvent } from './ics-parser';
import { recordModifiedEvent, cleanupExpiredModifications } from './notification-service';

const STORAGE_KEY = '@emploi_du_temps_events';
const LAST_SYNC_KEY = '@emploi_du_temps_last_sync';
const ICS_URL_KEY = '@emploi_du_temps_ics_url';
const COURSES_HASH_KEY = '@emploi_du_temps_courses_hash';

// URL par défaut fournie par l'utilisateur
const DEFAULT_ICS_URL = 'https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=b69e9594f80ff0463d0c0f8da12a5b8d2ad2bc44567c9aba276333fe3ae8d54a2a2c262ab3ba48506729f6560ae33af6fa8513c753526e332bda1edc491dcfab,1';

export interface SyncResult {
  success: boolean;
  events: CourseEvent[];
  lastSync: Date;
  error?: string;
}

/**
 * Génère un hash simple pour détecter les changements
 */
function hashCourses(courses: CourseEvent[]): string {
  const sortedCourses = courses.sort((a, b) => a.id.localeCompare(b.id));
  const courseStrings = sortedCourses.map(c => 
    `${c.id}|${c.title}|${c.startTime.getTime()}|${c.endTime.getTime()}|${c.location}|${c.status}`
  );
  return courseStrings.join('||');
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
  console.log('[SYNC] Téléchargement depuis:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar, application/rss+xml, */*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    });
    
    console.log('[SYNC] Status:', response.status);
    console.log('[SYNC] Headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log('[SYNC] Contenu reçu:', text.length, 'caractères');
    
    return text;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[SYNC] Erreur de téléchargement:', errorMsg);
    throw error;
  }
}

/**
 * Sauvegarde les événements dans le stockage local
 */
async function saveEvents(events: CourseEvent[]): Promise<void> {
  try {
    const jsonData = JSON.stringify(events);
    await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    console.log('[SYNC] Sauvegardé:', events.length, 'événements');
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
      console.log('[SYNC] Aucun événement en cache');
      return [];
    }
    
    const events = JSON.parse(jsonData);
    console.log('[SYNC] Chargé du cache:', events.length, 'événements');
    
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
  console.log('[SYNC] Début de la synchronisation');
  
  try {
    const url = await getICSUrl();
    
    if (!url) {
      throw new Error('Aucune URL configurée. Veuillez définir l\'URL du flux dans les paramètres.');
    }
    
    // Télécharger le fichier ICS
    const icsContent = await downloadICS(url);
    
    if (!icsContent || icsContent.trim().length === 0) {
      throw new Error('Le serveur a retourné une réponse vide. Vérifiez l\'URL.');
    }
    
    // Vérifier si c'est une erreur HTML (erreur serveur)
    if (icsContent.includes('<!doctype') || icsContent.includes('<html')) {
      console.error('[SYNC] Réponse HTML détectée (erreur serveur)');
      throw new Error('Le serveur a retourné une erreur. L\'URL du flux est peut-être invalide ou le serveur est en maintenance.');
    }
    
    // Parser le contenu
    console.log('[SYNC] Parsing du contenu...');
    const events = parseICS(icsContent);
    console.log('[SYNC] Événements parsés:', events.length);
    
    if (events.length === 0) {
      throw new Error('Aucun événement trouvé dans le flux. Vérifiez que l\'URL est correcte.');
    }
    
    // Récupérer les anciens cours pour détecter les changements
    const oldCourses = await loadEvents();
    const oldHash = oldCourses.length > 0 ? hashCourses(oldCourses) : '';
    const newHash = hashCourses(events);

    // Détecter les changements
    if (oldHash !== newHash && oldCourses.length > 0) {
      console.log('[SYNC] Changements détectés dans l\'emploi du temps');
      
      const oldCoursesMap = new Map(oldCourses.map(c => [c.id, c]));
      const newCoursesMap = new Map(events.map(c => [c.id, c]));
      
      // Cours créés
      for (const course of events) {
        if (!oldCoursesMap.has(course.id)) {
          await recordModifiedEvent(
            course.id,
            course.title,
            'created',
            `Nouveau cours: ${course.title} à ${course.startTime.toLocaleTimeString('fr-FR')}`
          );
        }
      }
      
      // Cours modifiés
      for (const course of events) {
        const oldCourse = oldCoursesMap.get(course.id);
        if (oldCourse && JSON.stringify(oldCourse) !== JSON.stringify(course)) {
          const changes = [];
          if (oldCourse.location !== course.location) {
            changes.push(`Salle: ${oldCourse.location} → ${course.location}`);
          }
          if (oldCourse.startTime.getTime() !== course.startTime.getTime()) {
            changes.push(`Heure: ${oldCourse.startTime.toLocaleTimeString('fr-FR')} → ${course.startTime.toLocaleTimeString('fr-FR')}`);
          }
          if (oldCourse.status !== course.status) {
            changes.push(`Statut: ${oldCourse.status} → ${course.status}`);
          }
          
          if (changes.length > 0) {
            await recordModifiedEvent(
              course.id,
              course.title,
              'modified',
              changes.join(', ')
            );
          }
        }
      }
      
      // Cours supprimés/annulés
      for (const oldCourse of oldCourses) {
        if (!newCoursesMap.has(oldCourse.id)) {
          await recordModifiedEvent(
            oldCourse.id,
            oldCourse.title,
            'cancelled',
            `Cours annulé: ${oldCourse.title}`
          );
        }
      }
    }
    
    // Sauvegarder les nouveaux événements
    await saveEvents(events);
    
    // Mettre à jour la date de dernière sync
    const now = new Date();
    await setLastSyncDate(now);
    await AsyncStorage.setItem(COURSES_HASH_KEY, newHash);
    
    // Nettoyer les modifications expirées
    await cleanupExpiredModifications();
    
    console.log('[SYNC] Synchronisation réussie');
    
    return {
      success: true,
      events,
      lastSync: now,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la synchronisation';
    console.error('[SYNC] Erreur:', errorMessage);
    
    // En cas d'erreur, retourner les événements en cache
    const cachedEvents = await loadEvents();
    const lastSync = await getLastSyncDate();
    
    return {
      success: false,
      events: cachedEvents,
      lastSync: lastSync || new Date(),
      error: errorMessage,
    };
  }
}

/**
 * Initialise le service de synchronisation
 */
export async function initSyncService(): Promise<void> {
  console.log('[SYNC] Initialisation du service');
  
  // Charger les événements en cache au démarrage
  const events = await loadEvents();
  
  if (events.length === 0) {
    console.log('[SYNC] Pas de cache, synchronisation immédiate');
    // Première utilisation, synchroniser immédiatement
    await syncSchedule();
  } else {
    console.log('[SYNC] Cache trouvé:', events.length, 'événements');
  }
}
