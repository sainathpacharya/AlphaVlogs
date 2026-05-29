import {
  resolveEventsPayload,
} from '../../src/services/events-service';

describe('resolveEventsPayload', () => {
  it('returns bare API array as-is', () => {
    const api = [{ id: 1, name: 'national anthem' }];
    expect(resolveEventsPayload(api)).toBe(api);
  });

  it('unwraps { data: [...] }', () => {
    const inner = [{ id: 2, name: 'singing' }];
    expect(resolveEventsPayload({ success: true, data: inner })).toBe(inner);
  });
});
