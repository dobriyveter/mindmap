/**
 * Obsidian Local REST API Integration
 * 
 * Requires the "Local REST API" plugin installed in Obsidian.
 * Plugin: https://github.com/coddingtonbear/obsidian-local-rest-api
 * 
 * Default endpoint: http://127.0.0.1:27124
 */

// Используем HTTP вместо HTTPS чтобы избежать проблем с самоподписанным сертификатом
const OBSIDIAN_API_BASE = 'http://127.0.0.1:27124';

// API ключ будет устанавливаться из настроек
let apiKey = '';

export function setObsidianApiKey(key: string) {
  apiKey = key;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  return headers;
}

interface ObsidianNote {
  path: string;
  name: string;
  content?: string;
}

interface ObsidianSearchResult {
  path: string;
  name: string;
}

/**
 * Check if Obsidian REST API is available
 */
export async function checkObsidianConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OBSIDIAN_API_BASE}/vault`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Search notes in Obsidian vault
 */
export async function searchObsidianNotes(query: string): Promise<ObsidianSearchResult[]> {
  try {
    const response = await fetch(
      `${OBSIDIAN_API_BASE}/search?query=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.map((item: any) => ({
      path: item.path || item.filename,
      name: item.name || item.filename?.replace('.md', ''),
    }));
  } catch {
    console.warn('Obsidian API not available');
    return [];
  }
}

/**
 * Get note content from Obsidian
 */
export async function getObsidianNote(path: string): Promise<string | null> {
  try {
    const headers = getHeaders();
    (headers as Record<string, string>)['Accept'] = 'text/markdown';
    
    const response = await fetch(
      `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(path)}`,
      {
        method: 'GET',
        headers,
      }
    );
    
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Create a new note in Obsidian
 */
export async function createObsidianNote(path: string, content: string): Promise<boolean> {
  try {
    const headers = getHeaders();
    (headers as Record<string, string>)['Content-Type'] = 'text/markdown';
    
    const response = await fetch(
      `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers,
        body: content,
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List all notes in vault
 */
export async function listObsidianNotes(): Promise<ObsidianNote[]> {
  try {
    const response = await fetch(
      `${OBSIDIAN_API_BASE}/vault/?recursively=true`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );
    
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

/**
 * Generate an Obsidian URI link
 */
export function generateObsidianUri(vaultName: string, noteName: string): string {
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(noteName)}`;
}

/**
 * Open note in Obsidian app
 */
export function openInObsidian(vaultName: string, noteName: string): void {
  const uri = generateObsidianUri(vaultName, noteName);
  window.open(uri, '_blank');
}
