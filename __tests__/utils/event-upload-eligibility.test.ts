import {
  evaluateEventUploadEligibility,
  getEventUploadWindow,
  parseEventBoundary,
} from '../../src/utils/event-upload-eligibility';

describe('event-upload-eligibility', () => {
  it('returns null for empty and invalid date strings', () => {
    expect(parseEventBoundary(undefined, false)).toBeNull();
    expect(parseEventBoundary('   ', false)).toBeNull();
    expect(parseEventBoundary('not-a-date', false)).toBeNull();
  });

  it('prefers upload window dates over event dates', () => {
    expect(
      getEventUploadWindow({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        uploadStartDate: '2024-06-01',
        uploadEndDate: '2024-06-30',
      }),
    ).toEqual({start: '2024-06-01', end: '2024-06-30'});
  });

  it('falls back to event dates when upload dates are empty', () => {
    expect(
      getEventUploadWindow({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        uploadStartDate: '',
        uploadEndDate: '',
      }),
    ).toEqual({start: '2024-01-01', end: '2024-12-31'});
  });

  it('blocks inactive events', () => {
    const result = evaluateEventUploadEligibility({
      isActive: false,
      canUpload: true,
      uploadStartDate: '2020-01-01',
      uploadEndDate: '2030-12-31',
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('inactive');
  });

  it('blocks when uploads are disabled for the event', () => {
    const result = evaluateEventUploadEligibility({
      isActive: true,
      canUpload: false,
      uploadStartDate: '2020-01-01',
      uploadEndDate: '2030-12-31',
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('uploads_disabled');
  });

  it('blocks before start date', () => {
    const result = evaluateEventUploadEligibility(
      {
        isActive: true,
        canUpload: true,
        uploadStartDate: '2099-01-01',
        uploadEndDate: '2099-12-31',
      },
      Date.parse('2026-06-25'),
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('not_started');
  });

  it('blocks after end date', () => {
    const result = evaluateEventUploadEligibility(
      {
        isActive: true,
        canUpload: true,
        uploadStartDate: '2020-01-01',
        uploadEndDate: '2020-12-31',
      },
      Date.parse('2026-06-25'),
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('ended');
  });

  it('allows uploads inside the active window', () => {
    const now = parseEventBoundary('2026-06-25', false)!;
    const result = evaluateEventUploadEligibility(
      {
        isActive: true,
        canUpload: true,
        uploadStartDate: '2026-06-01',
        uploadEndDate: '2026-06-30',
      },
      now,
    );

    expect(result.allowed).toBe(true);
  });
});
