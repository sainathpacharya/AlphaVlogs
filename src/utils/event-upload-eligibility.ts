export interface EventUploadWindow {
  isActive?: boolean;
  canUpload?: boolean;
  startDate?: string;
  endDate?: string;
  uploadStartDate?: string;
  uploadEndDate?: string;
}

export type EventUploadBlockReason =
  | 'inactive'
  | 'uploads_disabled'
  | 'not_started'
  | 'ended';

export interface EventUploadEligibility {
  allowed: boolean;
  reason?: EventUploadBlockReason;
  message?: string;
}

/** Parse API date strings; optional end-of-day for inclusive end dates. */
export function parseEventBoundary(
  dateStr: string | undefined,
  endOfDay: boolean,
): number | null {
  const trimmed = dateStr?.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed.getTime();
}

/** Prefer upload window dates; fall back to event start/end. */
export function getEventUploadWindow(event: EventUploadWindow): {
  start: string;
  end: string;
} {
  return {
    start: event.uploadStartDate?.trim() || event.startDate?.trim() || '',
    end: event.uploadEndDate?.trim() || event.endDate?.trim() || '',
  };
}

export function evaluateEventUploadEligibility(
  event: EventUploadWindow,
  nowMs = Date.now(),
): EventUploadEligibility {
  if (event.isActive === false) {
    return {
      allowed: false,
      reason: 'inactive',
      message: 'This event is not active right now.',
    };
  }

  if (event.canUpload === false) {
    return {
      allowed: false,
      reason: 'uploads_disabled',
      message: 'Video uploads are not open for this event.',
    };
  }

  const {start, end} = getEventUploadWindow(event);
  const startMs = parseEventBoundary(start, false);
  const endMs = parseEventBoundary(end, true);

  if (startMs != null && nowMs < startMs) {
    return {
      allowed: false,
      reason: 'not_started',
      message: 'This event has not started yet. Please check back later.',
    };
  }

  if (endMs != null && nowMs > endMs) {
    return {
      allowed: false,
      reason: 'ended',
      message: 'This event has ended. Uploads are no longer accepted.',
    };
  }

  return {allowed: true};
}
