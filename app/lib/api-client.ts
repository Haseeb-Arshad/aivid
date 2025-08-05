import type { 
  MediaFileResponse, 
  ProjectResponse, 
  UserResponse, 
  Token, 
  UploadResponse,
  TranscriptionResponse,
  APIResponse 
} from './types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.your-domain.com' 
  : 'http://localhost:8000';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<Token> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    return this.request<Token>('/auth/login', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async register(email: string, password: string): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/me');
  }

  // Media methods
  async uploadMedia(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new APIError('Invalid JSON response', xhr.status));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new APIError(
              errorData.detail || `HTTP ${xhr.status}`,
              xhr.status,
              errorData
            ));
          } catch {
            reject(new APIError(`HTTP ${xhr.status}`, xhr.status));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new APIError('Network error', 0));
      });

      xhr.open('POST', `${this.baseURL}/media/upload`);
      
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      
      xhr.send(formData);
    });
  }

  async getMediaFiles(): Promise<MediaFileResponse[]> {
    return this.request<MediaFileResponse[]>('/media/');
  }

  async getMediaFile(mediaId: string): Promise<MediaFileResponse> {
    return this.request<MediaFileResponse>(`/media/${mediaId}`);
  }

  async deleteMediaFile(mediaId: string): Promise<APIResponse> {
    return this.request<APIResponse>(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  // Project methods
  async createProject(project: {
    name: string;
    duration?: number;
    fps?: number;
    resolution_width?: number;
    resolution_height?: number;
    tracks_data?: any;
  }): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('/projects/', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getProjects(): Promise<ProjectResponse[]> {
    return this.request<ProjectResponse[]>('/projects/');
  }

  async getProject(projectId: string): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${projectId}`);
  }

  async updateProject(
    projectId: string, 
    updates: Partial<{
      name: string;
      duration: number;
      fps: number;
      resolution_width: number;
      resolution_height: number;
      tracks_data: any;
    }>
  ): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<APIResponse> {
    return this.request<APIResponse>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // AI/Transcription methods
  async transcribeMedia(mediaFileId: string): Promise<TranscriptionResponse> {
    return this.request<TranscriptionResponse>('/transcribe', {
      method: 'POST',
      body: JSON.stringify({ media_file_id: mediaFileId }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Retry mechanism with exponential backoff
export class RetryableAPIClient extends APIClient {
  async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint, options);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof APIError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Create singleton instances
export const apiClient = new APIClient();
export const retryableApiClient = new RetryableAPIClient();

// Export error class for error handling
export { APIError };