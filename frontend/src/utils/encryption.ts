// Simple encryption utility for notepad
export class SimpleEncryption {
  private static async getKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(text: string, password: string): Promise<string> {
    try {
      const key = await this.getKey(password);
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);
      
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt text');
    }
  }

  static async decrypt(encryptedText: string, password: string): Promise<string> {
    try {
      const key = await this.getKey(password);
      const data = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
      const iv = data.slice(0, 12);
      const encrypted = data.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt text');
    }
  }
}

// Local storage utility for notes
export class NoteStorage {
  private static readonly STORAGE_KEY = 'notepad_notes';
  private static readonly CURRENT_NOTE_KEY = 'notepad_current_note';

  static saveNote(noteId: string, content: string, isEncrypted: boolean = false, password?: string) {
    const notes = this.getAllNotes();
    notes[noteId] = {
      content,
      isEncrypted,
      password: isEncrypted ? password : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
  }

  static getNote(noteId: string): { content: string; isEncrypted: boolean; password?: string } | null {
    const notes = this.getAllNotes();
    return notes[noteId] || null;
  }

  static getAllNotes(): Record<string, any> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  static deleteNote(noteId: string) {
    const notes = this.getAllNotes();
    delete notes[noteId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
  }

  static saveCurrentNote(content: string) {
    localStorage.setItem(this.CURRENT_NOTE_KEY, content);
  }

  static getCurrentNote(): string {
    return localStorage.getItem(this.CURRENT_NOTE_KEY) || '';
  }

  static generateNoteId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
