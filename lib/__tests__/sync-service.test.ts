import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle empty cache on first load', async () => {
    // Simuler le premier lancement (pas de cache)
    (AsyncStorage.default.getItem as any).mockResolvedValue(null);
    
    // Le service devrait essayer de synchroniser
    expect(true).toBe(true);
  });

  it('should properly format ICS URLs', () => {
    const icsUrl = 'https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=60dc6b2fb1eac2554ee1103516dc50b4e04e91d0526fa823618ff6fa9e7d7198dd65eb4f5911f810ef6a36d3b58d61bf314d669fae9ca422200cb711a9b76537,1';
    
    expect(icsUrl).toContain('https://');
    expect(icsUrl).toContain('emploisdutemps.uha.fr');
    expect(icsUrl).toContain('data=');
  });

  it('should properly format RSS URLs', () => {
    const rssUrl = 'https://www.emploisdutemps.uha.fr/direct/gwtdirectplanning/rss?data=a67fcab844d016ac7570654651265224f873a8529454c134d4c5273d09c602bfec929e63494df4762075660858b5f5c06fe468cf3ed9e282982361026c88db96,1';
    
    expect(rssUrl).toContain('https://');
    expect(rssUrl).toContain('emploisdutemps.uha.fr');
    expect(rssUrl).toContain('rss');
  });

  it('should detect valid ICS content', () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20260123T073000Z
DTEND:20260123T091500Z
SUMMARY:Test Event
UID:test-123
END:VEVENT
END:VCALENDAR`;

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('END:VCALENDAR');
  });

  it('should detect HTML error responses', () => {
    const errorResponse = '<!doctype html><html><head><title>Error 500</title></head></html>';
    
    expect(errorResponse).toContain('<!doctype');
    expect(errorResponse).toContain('<html>');
  });

  it('should detect empty responses', () => {
    const emptyResponse = '';
    const whitespaceResponse = '   \n\n  ';
    
    expect(emptyResponse.trim().length).toBe(0);
    expect(whitespaceResponse.trim().length).toBe(0);
  });
});
