const API_BASE_URL = 'http://localhost:3001/api';

export interface NoteData {
  key: string;
  pad: string;
  pw: string;
  url: string;
  monospace: string;
  caret: number;
  files?: FileData[];
}

export interface FileData {
  id: string;
  noteId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  key?: string;
  pad?: string;
  pw?: string;
  url?: string;
  monospace?: string;
  caret?: number;
  files?: FileData[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
  details?: any[];
}

class NotepadAPI {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async saveNote(noteData: Partial<NoteData>): Promise<ApiResponse> {
    const formData = new URLSearchParams();
    
    if (noteData.key) formData.append('key', noteData.key);
    if (noteData.pad) formData.append('pad', noteData.pad);
    if (noteData.pw) formData.append('pw', noteData.pw);
    if (noteData.url) formData.append('url', noteData.url);
    if (noteData.monospace) formData.append('monospace', noteData.monospace);
    if (noteData.caret) formData.append('caret', noteData.caret.toString());

    return this.request<ApiResponse>('/save', {
      method: 'POST',
      body: formData.toString(),
    });
  }

  async loadNote(id: string, password?: string): Promise<ApiResponse> {
    const url = password ? `/load/${id}?pw=${encodeURIComponent(password)}` : `/load/${id}`;
    return this.request<ApiResponse>(url, {
      method: 'GET',
    });
  }

  async deleteNote(id: string, password?: string): Promise<ApiResponse> {
    const url = password ? `/delete/${id}?pw=${encodeURIComponent(password)}` : `/delete/${id}`;
    return this.request<ApiResponse>(url, {
      method: 'DELETE',
    });
  }

  async changeUrl(id: string, newUrl: string, password?: string): Promise<ApiResponse> {
    const formData = new URLSearchParams();
    formData.append('newUrl', newUrl);
    if (password) {
      formData.append('pw', password);
    }

    return this.request<ApiResponse>(`/change-url/${id}`, {
      method: 'PUT',
      body: formData.toString(),
    });
  }

  async healthCheck(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/health', {
      method: 'GET',
    });
  }

  // File management methods
  async uploadFiles(noteId: string, files: File[]): Promise<{ success: boolean; files?: FileData[]; error?: string }> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload/${noteId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading files:', error);
      return {
        success: false,
        error: 'Failed to upload files'
      };
    }
  }

  async getFiles(noteId: string): Promise<{ success: boolean; files?: FileData[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${noteId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting files:', error);
      return {
        success: false,
        error: 'Failed to get files'
      };
    }
  }

  async downloadFile(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/file/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ''; // Let the server set the filename
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/file/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: 'Failed to delete file'
      };
    }
  }

  // Authentication methods
  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        error: 'Failed to register user'
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        error: 'Failed to login'
      };
    }
  }

  async getCurrentUser(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        error: 'Failed to get user profile'
      };
    }
  }

  async updateProfile(token: string, userData: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging out:', error);
      return {
        success: false,
        error: 'Failed to logout'
      };
    }
  }

  // Link files from one note to another (without copying files)
  async linkFiles(fromNoteId: string, toNoteId: string): Promise<{ success: boolean; files?: FileData[]; error?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/link-files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromNoteId,
          toNoteId
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error linking files:', error);
      return {
        success: false,
        error: 'Failed to link files'
      };
    }
  }
}

export const notepadAPI = new NotepadAPI();
