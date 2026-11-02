/**
 * Obsidian Integration
 * 
 * Поддерживает два режима:
 * 1. Electron (десктоп) - прямое чтение файлов из vault
 * 2. Browser - через Local REST API плагин
 */

// Проверяем наличие Electron API
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

interface ElectronAPI {
  obsidian: {
    checkVault: (vaultPath: string) => Promise<{ exists: boolean; path?: string; error?: string }>;
    listNotes: (vaultPath: string) => Promise<{ success: boolean; notes: any[]; count: number; error?: string }>;
    readNote: (vaultPath: string, notePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    searchNotes: (vaultPath: string, query: string) => Promise<{ success: boolean; results: any[]; count: number; error?: string }>;
    writeNote: (vaultPath: string, notePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  };
}

// Получаем Electron API
function getElectronAPI(): ElectronAPI | null {
  if (isElectron) {
    return (window as any).electronAPI;
  }
  return null;
}

// Путь к vault будет устанавливаться из настроек
let vaultPath = '';

export function setObsidianVaultPath(path: string) {
  vaultPath = path.trim();
  console.log('📁 Vault path set:', vaultPath || 'EMPTY');
}

export function getObsidianVaultPath(): string {
  return vaultPath;
}

// API ключ для REST API (fallback для браузера)
let apiKey = '';

export function setObsidianApiKey(key: string) {
  apiKey = key.trim();
  console.log('🔑 API Key set:', apiKey ? `${apiKey.substring(0, 10)}...` : 'EMPTY');
}

export function getObsidianApiKey(): string {
  return apiKey;
}

interface ObsidianNote {
  path: string;
  name: string;
  content?: string;
  size?: number;
  modified?: string;
}

interface ObsidianSearchResult {
  path: string;
  name: string;
  context?: string;
}

/**
 * Проверка подключения к Obsidian
 */
export async function checkObsidianConnection(): Promise<boolean> {
  console.log('🔍 Checking Obsidian connection...');
  console.log('📁 Vault path:', vaultPath || 'NOT SET');
  console.log('🖥️ Is Electron:', isElectron);
  
  // Если мы в Electron - проверяем файловую систему
  if (isElectron && vaultPath) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      try {
        const result = await electronAPI.obsidian.checkVault(vaultPath);
        console.log('📁 Vault check result:', result);
        
        if (result.exists) {
          // Попробуем получить список заметок
          const notesResult = await electronAPI.obsidian.listNotes(vaultPath);
          console.log('✅ Obsidian connection successful via filesystem:', notesResult.count, 'notes found');
          return true;
        } else {
          console.error('❌ Vault path does not exist:', result.error);
          return false;
        }
      } catch (error) {
        console.error('❌ Obsidian connection error:', error);
        return false;
      }
    }
  }
  
  // Fallback: REST API (для браузера)
  if (apiKey) {
    const OBSIDIAN_API_BASE = 'http://127.0.0.1:27124';
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };
      
      const url = `${OBSIDIAN_API_BASE}/vault?apikey=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, { method: 'GET', headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Obsidian connection successful via REST API:', data);
        return true;
      } else {
        console.error('❌ REST API connection failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ REST API connection error:', error);
      return false;
    }
  }
  
  console.warn('⚠️ No vault path or API key set');
  return false;
}

/**
 * Получить список всех заметок
 */
export async function listObsidianNotes(): Promise<ObsidianNote[]> {
  // Electron - читаем файлы напрямую
  if (isElectron && vaultPath) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      try {
        const result = await electronAPI.obsidian.listNotes(vaultPath);
        if (result.success) {
          return result.notes;
        } else {
          console.error('❌ Failed to list notes:', result.error);
          return [];
        }
      } catch (error) {
        console.error('❌ Error listing notes:', error);
        return [];
      }
    }
  }
  
  // Fallback: REST API
  if (apiKey) {
    const OBSIDIAN_API_BASE = 'http://127.0.0.1:27124';
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };
      
      const url = `${OBSIDIAN_API_BASE}/vault/?recursively=true&apikey=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, { method: 'GET', headers });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data
        .filter((item: any) => item.endsWith('.md'))
        .map((path: string) => ({
          path,
          name: path.split('/').pop()?.replace('.md', '') || path,
        }));
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Поиск по заметкам
 */
export async function searchObsidianNotes(query: string): Promise<ObsidianSearchResult[]> {
  // Electron - ищем в файлах
  if (isElectron && vaultPath) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      try {
        const result = await electronAPI.obsidian.searchNotes(vaultPath, query);
        if (result.success) {
          return result.results;
        } else {
          console.error('❌ Failed to search notes:', result.error);
          return [];
        }
      } catch (error) {
        console.error('❌ Error searching notes:', error);
        return [];
      }
    }
  }
  
  // Fallback: REST API
  if (apiKey) {
    const OBSIDIAN_API_BASE = 'http://127.0.0.1:27124';
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };
      
      const url = `${OBSIDIAN_API_BASE}/search?query=${encodeURIComponent(query)}&apikey=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, { method: 'GET', headers });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.map((item: any) => ({
        path: item.path || item.filename,
        name: item.name || item.filename?.replace('.md', ''),
      }));
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Прочитать содержимое заметки
 */
export async function getObsidianNote(notePath: string): Promise<string | null> {
  // Electron - читаем файл напрямую
  if (isElectron && vaultPath) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      try {
        const result = await electronAPI.obsidian.readNote(vaultPath, notePath);
        if (result.success && result.content) {
          return result.content;
        } else {
          console.error('❌ Failed to read note:', result.error);
          return null;
        }
      } catch (error) {
        console.error('❌ Error reading note:', error);
        return null;
      }
    }
  }
  
  // Fallback: REST API
  if (apiKey) {
    const OBSIDIAN_API_BASE = 'http://127.0.0.1:27124';
    try {
      const headers: Record<string, string> = {
        'Accept': 'text/markdown',
        'Authorization': `Bearer ${apiKey}`,
      };
      
      const url = `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(notePath)}?apikey=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, { method: 'GET', headers });
      
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Создать/обновить заметку
 */
export async function createObsidianNote(notePath: string, content: string): Promise<boolean> {
  // Electron - записываем файл напрямую
  if (isElectron && vaultPath) {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      try {
        const result = await electronAPI.obsidian.writeNote(vaultPath, notePath, content);
        if (result.success) {
          return true;
        } else {
          console.error('❌ Failed to write note:', result.error);
          return false;
        }
      } catch (error) {
        console.error('❌ Error writing note:', error);
        return false;
      }
    }
  }
  
  // Fallback: REST API
  if (apiKey) {
    const OBSIDIAN_API_BASE = 'http://127.0.0.1:27124';
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'text/markdown',
        'Authorization': `Bearer ${apiKey}`,
      };
      
      const url = `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(notePath)}?apikey=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: content,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  return false;
}

/**
 * Генерация Obsidian URI ссылки
 */
export function generateObsidianUri(vaultName: string, noteName: string): string {
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(noteName)}`;
}

/**
 * Открыть заметку в Obsidian
 */
export function openInObsidian(vaultName: string, noteName: string): void {
  const uri = generateObsidianUri(vaultName, noteName);
  
  // В Electron используем shell.openExternal через IPC
  if (isElectron) {
    const electronAPI = getElectronAPI();
    if (electronAPI && 'openExternal' in electronAPI) {
      (electronAPI as any).openExternal(uri);
      return;
    }
  }
  
  // Fallback для браузера
  window.open(uri, '_blank');
}
