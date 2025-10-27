import { subscriptionService } from '../../src/services/subscription-service';

// Mock the API service
jest.mock('../../src/services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Subscription Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(subscriptionService).toBeDefined();
  });

  it('should have updateSubscription method', () => {
    expect(subscriptionService.updateSubscription).toBeDefined();
    expect(typeof subscriptionService.updateSubscription).toBe('function');
  });
});
