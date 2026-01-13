import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants';
import { MockWrapperService } from './mock-wrapper';

export interface GifData {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  fileSize: number;
  duration?: number;
  tags: string[];
  source: string;
  createdAt: string;
  category?: string;
}

export interface GifSearchResult {
  gifs: GifData[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

export interface GifUploadRequest {
  gifFile: any; // File object
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  onProgress?: (progress: number) => void;
}

export interface GifUploadResponse {
  success: boolean;
  gifId?: string;
  gifUrl?: string;
  message?: string;
}

class GifService {
  // Get GIFs by category
  async getGifs(category?: string, limit: number = 20): Promise<GifData[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockGifs(category, limit);
      }

      const response = await apiService.get<GifData[]>(
        `${API_ENDPOINTS.GIF?.GIFS || '/api/gifs'}?category=${category || ''}&limit=${limit}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch GIFs');
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      return this.getMockGifs(category, limit);
    }
  }

  // Search GIFs
  async searchGifs(query: string, limit: number = 20): Promise<GifSearchResult> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockSearchResults(query, limit);
      }

      const response = await apiService.get<GifSearchResult>(
        `${API_ENDPOINTS.GIF?.SEARCH || '/api/gifs/search'}?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to search GIFs');
    } catch (error) {
      console.error('Error searching GIFs:', error);
      return this.getMockSearchResults(query, limit);
    }
  }

  // Get GIF by ID
  async getGifById(gifId: string): Promise<GifData | null> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockGifById(gifId);
      }

      const response = await apiService.get<GifData>(
        `${API_ENDPOINTS.GIF?.GIF_DETAILS || '/api/gifs'}/${gifId}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching GIF:', error);
      return this.getMockGifById(gifId);
    }
  }

  // Upload GIF
  async uploadGif(data: GifUploadRequest): Promise<GifUploadResponse> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.mockGifUpload(data);
      }

      // Validate GIF file
      this.validateGifFile(data.gifFile);

      // Prepare form data for upload
      const formData = new FormData();
      formData.append('gifFile', data.gifFile);
      formData.append('title', data.title);
      if (data.description) {formData.append('description', data.description);}
      if (data.tags) {formData.append('tags', JSON.stringify(data.tags));}
      if (data.category) {formData.append('category', data.category);}

      const response = await apiService.uploadFile<GifUploadResponse>(
        `${API_ENDPOINTS.GIF?.UPLOAD || '/api/gifs/upload'}`,
        formData,
        data.onProgress
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to upload GIF');
    } catch (error) {
      console.error('Error uploading GIF:', error);
      return {
        success: false,
        message: 'Failed to upload GIF. Please try again.',
      };
    }
  }

  // Get trending GIFs
  async getTrendingGifs(limit: number = 20): Promise<GifData[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockTrendingGifs(limit);
      }

      const response = await apiService.get<GifData[]>(
        `${API_ENDPOINTS.GIF?.TRENDING || '/api/gifs/trending'}?limit=${limit}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch trending GIFs');
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
      return this.getMockTrendingGifs(limit);
    }
  }

  // Get GIF categories
  async getCategories(): Promise<string[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getMockCategories();
      }

      const response = await apiService.get<string[]>(
        `${API_ENDPOINTS.GIF?.CATEGORIES || '/api/gifs/categories'}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getMockCategories();
    }
  }

  // Validate GIF file
  private validateGifFile(gifFile: any): void {
    if (!gifFile) {
      throw new Error('GIF file is required');
    }

    // Check file size (max 50MB for GIFs)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (gifFile.size && gifFile.size > maxSize) {
      throw new Error('GIF file is too large. Maximum size is 50MB.');
    }

    // Check file type
    const allowedTypes = ['image/gif', 'image/webp'];
    if (gifFile.type && !allowedTypes.includes(gifFile.type)) {
      throw new Error('Unsupported file format. Please use GIF or WebP format.');
    }
  }

  // Mock GIF upload
  private async mockGifUpload(data: GifUploadRequest): Promise<GifUploadResponse> {
    // Simulate upload progress
    if (data.onProgress) {
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          data.onProgress!(progress);
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 200);
      };
      simulateProgress();
    }

    // Simulate network delay
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    // Generate mock GIF ID
    const mockGifId = 'gif_' + Math.random().toString(36).substr(2, 9);

    return {
      success: true,
      gifId: mockGifId,
      gifUrl: `https://example.com/gifs/${mockGifId}.gif`,
      message: 'GIF uploaded successfully',
    };
  }

  // Mock data methods
  private getMockGifs(category?: string, limit: number = 20): GifData[] {
    const mockGifs: GifData[] = [
      {
        id: '1',
        title: 'Happy Dance GIF',
        description: 'A fun animated GIF of someone dancing happily',
        url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
        width: 480,
        height: 270,
        fileSize: 2048000,
        duration: 3.5,
        tags: ['dance', 'happy', 'celebration'],
        source: 'GIPHY',
        createdAt: '2024-01-15T10:00:00Z',
        category: 'reactions',
      },
      {
        id: '2',
        title: 'Loading Spinner',
        description: 'Animated loading spinner for UI',
        url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        width: 480,
        height: 480,
        fileSize: 1024000,
        duration: 2.0,
        tags: ['loading', 'spinner', 'ui'],
        source: 'GIPHY',
        createdAt: '2024-01-20T14:30:00Z',
        category: 'ui',
      },
      {
        id: '3',
        title: 'Success Checkmark',
        description: 'Animated success checkmark',
        url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVy/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVy/giphy.gif',
        width: 480,
        height: 270,
        fileSize: 1536000,
        duration: 1.5,
        tags: ['success', 'checkmark', 'done'],
        source: 'GIPHY',
        createdAt: '2024-02-01T09:15:00Z',
        category: 'reactions',
      },
      {
        id: '4',
        title: 'Cat Reaction',
        description: 'Funny cat reaction GIF',
        url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
        width: 480,
        height: 360,
        fileSize: 3072000,
        duration: 4.0,
        tags: ['cat', 'funny', 'reaction'],
        source: 'GIPHY',
        createdAt: '2024-02-05T16:45:00Z',
        category: 'animals',
      },
      {
        id: '5',
        title: 'Celebration Fireworks',
        description: 'Animated fireworks celebration',
        url: 'https://media.giphy.com/media/3o6Zt4HU9VqJQJQJQJQ/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3o6Zt4HU9VqJQJQJQJQ/giphy.gif',
        width: 480,
        height: 270,
        fileSize: 4096000,
        duration: 5.0,
        tags: ['fireworks', 'celebration', 'party'],
        source: 'GIPHY',
        createdAt: '2024-02-10T12:00:00Z',
        category: 'celebration',
      },
    ];

    if (category) {
      return mockGifs.filter(gif => gif.category === category).slice(0, limit);
    }

    return mockGifs.slice(0, limit);
  }

  private getMockGifById(gifId: string): GifData | null {
    const gifs = this.getMockGifs();
    return gifs.find(gif => gif.id === gifId) || null;
  }

  private getMockSearchResults(query: string, limit: number = 20): GifSearchResult {
    const allGifs = this.getMockGifs();
    const filteredGifs = allGifs.filter(gif =>
      gif.title.toLowerCase().includes(query.toLowerCase()) ||
      gif.description.toLowerCase().includes(query.toLowerCase()) ||
      gif.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    return {
      gifs: filteredGifs.slice(0, limit),
      totalCount: filteredGifs.length,
      hasMore: filteredGifs.length > limit,
      nextPage: filteredGifs.length > limit ? 2 : undefined,
    };
  }

  private getMockTrendingGifs(limit: number = 20): GifData[] {
    const allGifs = this.getMockGifs();
    // Sort by creation date (newest first) for trending
    return allGifs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  private getMockCategories(): string[] {
    return [
      'reactions',
      'ui',
      'animals',
      'celebration',
      'funny',
      'nature',
      'sports',
      'music',
      'art',
      'technology',
    ];
  }
}

export const gifService = new GifService();
