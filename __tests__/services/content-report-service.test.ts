import {Linking} from 'react-native';
import {
  buildContentReportEmailBody,
  submitContentReport,
} from '../../src/services/content-report-service';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

const mockCanOpenURL = Linking.canOpenURL as jest.MockedFunction<typeof Linking.canOpenURL>;
const mockOpenURL = Linking.openURL as jest.MockedFunction<typeof Linking.openURL>;

describe('content-report-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds a report email body with event context', () => {
    const body = buildContentReportEmailBody({
      reasonId: 'inappropriate',
      description: 'Video contained unsafe language during the school event.',
      reference: 'Talent Night 2026',
      eventId: 'evt_123',
      eventTitle: 'Talent Night',
      reporterUserId: 'user_1',
      reporterEmail: 'student@example.com',
    });

    expect(body).toContain('Reason: Inappropriate or harmful content');
    expect(body).toContain('Talent Night');
    expect(body).toContain('evt_123');
    expect(body).toContain('user_1');
  });

  it('opens a mailto link when the device supports email', async () => {
    mockCanOpenURL.mockResolvedValue(true);
    mockOpenURL.mockResolvedValue(undefined);

    await expect(
      submitContentReport({
        reasonId: 'spam',
        description: 'Repeated promotional uploads in the event feed.',
      }),
    ).resolves.toBe(true);

    expect(mockCanOpenURL).toHaveBeenCalled();
    expect(mockOpenURL).toHaveBeenCalledWith(
      expect.stringContaining('mailto:support@alphavlogs.com'),
    );
  });

  it('returns false when email is unavailable', async () => {
    mockCanOpenURL.mockResolvedValue(false);

    await expect(
      submitContentReport({
        reasonId: 'other',
        description: 'Another policy issue that needs review.',
      }),
    ).resolves.toBe(false);

    expect(mockOpenURL).not.toHaveBeenCalled();
  });
});
