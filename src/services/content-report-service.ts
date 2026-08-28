import {Linking, Platform} from 'react-native';
import {
  REPORT_CONTENT_COPY,
  type ReportReasonId,
} from '@/content/report-content';
import {LEGAL_CONTACT} from '@/constants/legal';

export interface ContentReportPayload {
  reasonId: ReportReasonId;
  description: string;
  reference?: string;
  eventId?: string;
  eventTitle?: string;
  reporterUserId?: string;
  reporterEmail?: string;
}

function getReasonLabel(reasonId: ReportReasonId): string {
  return (
    REPORT_CONTENT_COPY.reasons.find(reason => reason.id === reasonId)?.label ??
    reasonId
  );
}

export function buildContentReportEmailBody(
  payload: ContentReportPayload,
): string {
  const lines = [
    'Alpha Vlogs — Content Report',
    '',
    `Reason: ${getReasonLabel(payload.reasonId)}`,
    '',
    'Description:',
    payload.description.trim(),
  ];

  if (payload.reference?.trim()) {
    lines.push('', `Reference: ${payload.reference.trim()}`);
  }
  if (payload.eventTitle?.trim()) {
    lines.push('', `Event: ${payload.eventTitle.trim()}`);
  }
  if (payload.eventId?.trim()) {
    lines.push(`Event ID: ${payload.eventId.trim()}`);
  }
  if (payload.reporterUserId?.trim()) {
    lines.push('', `Reporter user ID: ${payload.reporterUserId.trim()}`);
  }
  if (payload.reporterEmail?.trim()) {
    lines.push(`Reporter email: ${payload.reporterEmail.trim()}`);
  }

  lines.push('', `Sent from: Alpha Vlogs mobile app (${Platform.OS})`);
  return lines.join('\n');
}

export async function submitContentReport(
  payload: ContentReportPayload,
): Promise<boolean> {
  const subject = encodeURIComponent('Alpha Vlogs content report');
  const body = encodeURIComponent(buildContentReportEmailBody(payload));
  const mailtoUrl = `mailto:${LEGAL_CONTACT.supportEmail}?subject=${subject}&body=${body}`;

  return Linking.canOpenURL(mailtoUrl).then(canOpen => {
    if (!canOpen) {
      return false;
    }
    return Linking.openURL(mailtoUrl).then(() => true);
  });
}
