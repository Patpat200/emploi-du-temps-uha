import { describe, it, expect } from 'vitest';
import { parseICS, groupEventsByDay, filterEventsByDateRange, getCurrentWeekEvents } from '../ics-parser';

describe('ICS Parser', () => {
  const sampleICS = `BEGIN:VCALENDAR
METHOD:REQUEST
PRODID:-//ADE/version 6.0
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTAMP:20260103T141130Z
DTSTART:20260123T073000Z
DTEND:20260123T091500Z
SUMMARY:R1.12 PPP Connaître son champ d'activité
LOCATION:GRI_F_012
DESCRIPTION:\\n\\nRT112\\nDROUHIN Frederic\\n(Exporté le:03/01/2026 15:11)\\n
UID:ADE60554841323032352d323032362d393932322d302d34
CREATED:19700101T000000Z
LAST-MODIFIED:20260103T141129Z
SEQUENCE:2142107631
END:VEVENT
BEGIN:VEVENT
DTSTAMP:20260103T141130Z
DTSTART:20260121T123000Z
DTEND:20260121T160000Z
SUMMARY:SAE 1.05 Traiter des données
LOCATION:GRI_F_209
DESCRIPTION:\\n\\nRT11\\n(Exporté le:03/01/2026 15:11)\\n
UID:ADE60554841323032352d323032362d32363335362d302d33
CREATED:19700101T000000Z
LAST-MODIFIED:20260103T141129Z
SEQUENCE:2142107631
END:VEVENT
END:VCALENDAR`;

  it('should parse ICS content correctly', () => {
    const events = parseICS(sampleICS);
    
    expect(events).toHaveLength(2);
    expect(events[0].title).toBe('SAE 1.05 Traiter des données');
    expect(events[0].location).toBe('GRI_F_209');
    expect(events[0].group).toBe('RT11');
    expect(events[0].type).toBe('SAE');
    
    expect(events[1].title).toBe('R1.12 PPP Connaître son champ d\'activité');
    expect(events[1].teacher).toBe('DROUHIN Frederic');
    expect(events[1].group).toBe('RT112');
  });

  it('should parse dates correctly', () => {
    const events = parseICS(sampleICS);
    
    const firstEvent = events[0];
    expect(firstEvent.startTime).toBeInstanceOf(Date);
    expect(firstEvent.endTime).toBeInstanceOf(Date);
    expect(firstEvent.startTime.getTime()).toBeLessThan(firstEvent.endTime.getTime());
  });

  it('should detect course types correctly', () => {
    const icsWithTypes = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260123T073000Z
DTEND:20260123T091500Z
SUMMARY:TP Réseaux
LOCATION:GRI_F_012
DESCRIPTION:RT112
UID:test1
LAST-MODIFIED:20260103T141129Z
END:VEVENT
BEGIN:VEVENT
DTSTART:20260123T093000Z
DTEND:20260123T111500Z
SUMMARY:TD Mathématiques
LOCATION:GRI_F_013
DESCRIPTION:RT112
UID:test2
LAST-MODIFIED:20260103T141129Z
END:VEVENT
BEGIN:VEVENT
DTSTART:20260123T113000Z
DTEND:20260123T131500Z
SUMMARY:CM Physique
LOCATION:GRI_F_014
DESCRIPTION:RT112
UID:test3
LAST-MODIFIED:20260103T141129Z
END:VEVENT
END:VCALENDAR`;

    const events = parseICS(icsWithTypes);
    
    expect(events[0].type).toBe('TP');
    expect(events[1].type).toBe('TD');
    expect(events[2].type).toBe('CM');
  });

  it('should group events by day', () => {
    const events = parseICS(sampleICS);
    const grouped = groupEventsByDay(events);
    
    expect(grouped.size).toBeGreaterThan(0);
    
    // Vérifier que chaque groupe contient des événements
    grouped.forEach((dayEvents, date) => {
      expect(Array.isArray(dayEvents)).toBe(true);
      expect(dayEvents.length).toBeGreaterThan(0);
    });
  });

  it('should filter events by date range', () => {
    const events = parseICS(sampleICS);
    
    const startDate = new Date('2026-01-20');
    const endDate = new Date('2026-01-25');
    
    const filtered = filterEventsByDateRange(events, startDate, endDate);
    
    expect(filtered.length).toBeGreaterThan(0);
    
    filtered.forEach(event => {
      expect(event.startTime.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      expect(event.startTime.getTime()).toBeLessThanOrEqual(endDate.getTime());
    });
  });

  it('should handle empty ICS content', () => {
    const events = parseICS('BEGIN:VCALENDAR\nEND:VCALENDAR');
    expect(events).toHaveLength(0);
  });

  it('should extract teacher name from description', () => {
    const events = parseICS(sampleICS);
    const eventWithTeacher = events.find(e => e.id === 'ADE60554841323032352d323032362d393932322d302d34');
    
    expect(eventWithTeacher?.teacher).toBe('DROUHIN Frederic');
  });

  it('should extract group from description', () => {
    const events = parseICS(sampleICS);
    
    events.forEach(event => {
      expect(event.group).toMatch(/RT\d+/);
    });
  });

  it('should sort events by start time', () => {
    const events = parseICS(sampleICS);
    
    for (let i = 1; i < events.length; i++) {
      expect(events[i].startTime.getTime()).toBeGreaterThanOrEqual(events[i - 1].startTime.getTime());
    }
  });
});
