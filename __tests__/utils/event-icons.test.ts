import {
  formatEventTitle,
  getEventIcon,
  normalizeEventNameKey,
  resolveDashboardEventId,
} from '../../src/utils/event-icons';

describe('event-icons utils', () => {
  describe('getEventIcon', () => {
    it('returns a stable icon reference for known event ids', () => {
      expect(getEventIcon('event_001')).toBe(getEventIcon('event_001'));
      expect(getEventIcon('event_015')).toBe(getEventIcon('event_015'));
    });

    it('falls back to the default icon for unknown ids', () => {
      const fallback = getEventIcon('event_999');
      expect(getEventIcon('')).toBe(fallback);
      expect(getEventIcon('unknown')).toBe(fallback);
    });
  });

  describe('normalizeEventNameKey', () => {
    it('lowercases, trims, and collapses whitespace', () => {
      expect(normalizeEventNameKey('  National   Anthem  ')).toBe('national anthem');
    });
  });

  describe('resolveDashboardEventId', () => {
    it('maps known event titles to icon ids', () => {
      expect(resolveDashboardEventId({ id: 99, title: 'Singing' })).toBe('event_003');
      expect(resolveDashboardEventId({ id: 1, name: 'Cooking' })).toBe('event_010');
      expect(
        resolveDashboardEventId({ id: 2, title: 'Comedy Act / Skit' }),
      ).toBe('event_006');
    });

    it('falls back to stringified backend id', () => {
      expect(resolveDashboardEventId({ id: 42, title: 'Unknown Event' })).toBe('42');
      expect(resolveDashboardEventId({ id: 'custom-id' })).toBe('custom-id');
    });
  });

  describe('formatEventTitle', () => {
    it('title-cases words and preserves slash segments', () => {
      expect(formatEventTitle('national anthem')).toBe('National Anthem');
      expect(formatEventTitle('comedy act / skit')).toBe('Comedy Act / Skit');
    });

    it('trims extra whitespace around slash separators', () => {
      expect(formatEventTitle('  movie   dialogues  ')).toBe('Movie Dialogues');
      expect(formatEventTitle('a  /  b')).toBe('A / B');
    });
  });
});
