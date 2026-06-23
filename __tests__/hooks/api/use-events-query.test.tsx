jest.mock('@tanstack/react-query', () =>
  jest.requireActual('../../../node_modules/@tanstack/react-query'),
);

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEventsQuery } from '../../../src/hooks/api/use-events-query';
import { eventsService } from '../../../src/services/events-service';

jest.mock('../../../src/services/events-service');
jest.mock('../../../src/utils/event-icons', () => ({
  resolveDashboardEventId: jest.fn(({ id, title }: { id: string | number; title: string }) =>
    String(title).toLowerCase().replace(/\s+/g, '-'),
  ),
}));
jest.mock('../../../src/utils/event-media', () => ({
  resolveEventGifUrl: jest.fn((gif?: string | null) => gif ?? 'https://default.gif'),
}));

const mockEventsService = eventsService as jest.Mocked<typeof eventsService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useEventsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps events to dashboard cards', async () => {
    mockEventsService.getEvents.mockResolvedValue({
      success: true,
      data: {
        data: [
          { id: '1', title: 'Singing', eventGif: '/gifs/sing.gif' },
          { id: 2, title: 'Dancing', eventGif: null },
        ],
      },
      statusCode: 200,
    } as any);

    const { result } = renderHook(() => useEventsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      {
        id: '1',
        iconId: 'singing',
        title: 'Singing',
        gifUrl: '/gifs/sing.gif',
      },
      {
        id: '2',
        iconId: 'dancing',
        title: 'Dancing',
        gifUrl: 'https://default.gif',
      },
    ]);
  });

  it('throws when events response is invalid', async () => {
    mockEventsService.getEvents.mockResolvedValue({
      success: false,
      error: 'Server down',
      statusCode: 500,
    } as any);

    const { result } = renderHook(() => useEventsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/Server down|Failed to load events/);
  });

  it('throws when data is not an array', async () => {
    mockEventsService.getEvents.mockResolvedValue({
      success: true,
      data: { data: null },
      statusCode: 200,
    } as any);

    const { result } = renderHook(() => useEventsQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
