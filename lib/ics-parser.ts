/**
 * Service de parsing pour les fichiers ICS (iCalendar)
 */

export interface CourseEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description: string;
  teacher: string;
  group: string;
  type: 'CM' | 'TD' | 'TP' | 'SAE' | 'EXAM' | 'VACANCES' | 'OTHER';
  status: 'normal' | 'modified' | 'cancelled';
  lastModified: Date;
}

/**
 * Parse une chaîne de date ICS au format YYYYMMDDTHHMMSSZ
 */
function parseICSDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(dateStr.substring(9, 11));
  const minute = parseInt(dateStr.substring(11, 13));
  const second = parseInt(dateStr.substring(13, 15));
  
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Détermine le type de cours à partir du titre
 */
function getCourseType(title: string): CourseEvent['type'] {
  const upperTitle = title.toUpperCase();
  
  if (upperTitle.includes('VACANCES')) return 'VACANCES';
  if (upperTitle.includes('EXAMEN') || upperTitle.includes('EXAM')) return 'EXAM';
  if (upperTitle.includes('SAE')) return 'SAE';
  if (upperTitle.includes('TP ') || upperTitle.startsWith('TP')) return 'TP';
  if (upperTitle.includes('TD ') || upperTitle.startsWith('TD')) return 'TD';
  if (upperTitle.includes('CM ') || upperTitle.startsWith('CM')) return 'CM';
  
  return 'OTHER';
}

/**
 * Extrait le nom de l'enseignant de la description
 */
function extractTeacher(description: string): string {
  // La description contient généralement le groupe et l'enseignant
  // Format: \n\nRT112\nDROUHIN Frederic\n(Exporté le:...)
  const lines = description.split('\n').filter(line => line.trim());
  
  // Chercher une ligne qui ressemble à un nom (contient des lettres majuscules et minuscules)
  for (const line of lines) {
    const trimmed = line.trim();
    // Ignorer les lignes qui commencent par RT (groupes) ou qui contiennent "Exporté"
    if (!trimmed.startsWith('RT') && !trimmed.includes('Exporté') && trimmed.length > 3) {
      // Vérifier si c'est un nom (contient au moins une majuscule et une minuscule)
      if (/[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed)) {
        return trimmed;
      }
    }
  }
  
  return '';
}

/**
 * Extrait le groupe de la description
 */
function extractGroup(description: string): string {
  // Chercher les groupes RT11, RT112, etc.
  const match = description.match(/RT\d+/);
  return match ? match[0] : '';
}

/**
 * Parse le contenu d'un fichier ICS et retourne un tableau d'événements
 */
export function parseICS(icsContent: string): CourseEvent[] {
  const events: CourseEvent[] = [];
  
  // Diviser le contenu en événements individuels
  const eventBlocks = icsContent.split('BEGIN:VEVENT');
  
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    
    try {
      // Extraire les champs
      const uidMatch = block.match(/UID:(.*)/);
      const summaryMatch = block.match(/SUMMARY:(.*?)(?:\n[A-Z]|\n\n)/s);
      const dtstartMatch = block.match(/DTSTART:(\d{8}T\d{6}Z)/);
      const dtendMatch = block.match(/DTEND:(\d{8}T\d{6}Z)/);
      const locationMatch = block.match(/LOCATION:(.*?)(?:\n[A-Z]|\n\n)/s);
      const descriptionMatch = block.match(/DESCRIPTION:(.*?)(?:\nUID)/s);
      const lastModifiedMatch = block.match(/LAST-MODIFIED:(\d{8}T\d{6}Z)/);
      
      if (!uidMatch || !summaryMatch || !dtstartMatch || !dtendMatch) {
        continue;
      }
      
      const id = uidMatch[1].trim();
      const title = summaryMatch[1].trim().replace(/\n /g, ''); // Gérer les lignes pliées
      const startTime = parseICSDate(dtstartMatch[1]);
      const endTime = parseICSDate(dtendMatch[1]);
      const location = locationMatch ? locationMatch[1].trim().replace(/\\,/g, ',') : '';
      const description = descriptionMatch ? descriptionMatch[1].trim().replace(/\\n/g, '\n') : '';
      const lastModified = lastModifiedMatch ? parseICSDate(lastModifiedMatch[1]) : new Date();
      
      const teacher = extractTeacher(description);
      const group = extractGroup(description);
      const type = getCourseType(title);
      
      events.push({
        id,
        title,
        startTime,
        endTime,
        location,
        description,
        teacher,
        group,
        type,
        status: 'normal',
        lastModified,
      });
    } catch (error) {
      console.error('Erreur lors du parsing d\'un événement:', error);
    }
  }
  
  // Trier par date de début
  events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  return events;
}

/**
 * Groupe les événements par jour
 */
export function groupEventsByDay(events: CourseEvent[]): Map<string, CourseEvent[]> {
  const grouped = new Map<string, CourseEvent[]>();
  
  for (const event of events) {
    const dateKey = event.startTime.toISOString().split('T')[0];
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    
    grouped.get(dateKey)!.push(event);
  }
  
  return grouped;
}

/**
 * Filtre les événements pour une période donnée
 */
export function filterEventsByDateRange(
  events: CourseEvent[],
  startDate: Date,
  endDate: Date
): CourseEvent[] {
  return events.filter(event => {
    const eventDate = event.startTime.getTime();
    return eventDate >= startDate.getTime() && eventDate <= endDate.getTime();
  });
}

/**
 * Obtient les événements de la semaine en cours
 */
export function getCurrentWeekEvents(events: CourseEvent[]): CourseEvent[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
  endOfWeek.setHours(23, 59, 59, 999);
  
  return filterEventsByDateRange(events, startOfWeek, endOfWeek);
}
