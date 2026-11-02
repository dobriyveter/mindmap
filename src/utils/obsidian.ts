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
  apiKey = key.trim(); // Убираем пробелы в начале и конце
  console.log('🔑 API Key set:', apiKey ? `${apiKey.substring(0, 10)}...` : 'EMPTY');
}

export function getObsidianApiKey(): string {
  return apiKey;
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (apiKey) {
    // Local REST API plugin expects the key in Authorization header
    headers['Authorization'] = `Bearer ${apiKey}`;
    console.log('🔑 Using API key for authentication:', apiKey.substring(0, 10) + '...');
  } else {
    console.warn('⚠️ No API key set!');
  }
  return headers;
}

// Helper function to add API key as query parameter if needed
function addApiKeyToUrl(url: string): string {
  if (apiKey && !url.includes('apikey=')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}apikey=${encodeURIComponent(apiKey)}`;
  }
  return url;
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
  console.log('🔍 Checking Obsidian connection...');
  console.log('📍 API Base:', OBSIDIAN_API_BASE);
  console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  
  try {
    // Always send API key in both header and URL parameter
    const headers = getHeaders();
    const urlWithKey = apiKey ? `${OBSIDIAN_API_BASE}/vault?apikey=${encodeURIComponent(apiKey)}` : `${OBSIDIAN_API_BASE}/vault`;
    
    console.log('📤 Request URL:', urlWithKey);
    console.log('📤 Request headers:', headers);
    
    const response = await fetch(urlWithKey, {
      method: 'GET',
      headers,
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Obsidian connection successful:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Obsidian connection failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Obsidian connection error:', error);
    return false;
  }
}

/**
 * Search notes in Obsidian vault
 */
export async function searchObsidianNotes(query: string): Promise<ObsidianSearchResult[]> {
  try {
    let url = `${OBSIDIAN_API_BASE}/search?query=${encodeURIComponent(query)}`;
    url = addApiKeyToUrl(url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
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
    
    let url = `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(path)}`;
    url = addApiKeyToUrl(url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
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
    
    let url = `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(path)}`;
    url = addApiKeyToUrl(url);
    
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

/**
 * List all notes in vault
 */
export async function listObsidianNotes(): Promise<ObsidianNote[]> {
  try {
    let url = `${OBSIDIAN_API_BASE}/vault/?recursively=true`;
    url = addApiKeyToUrl(url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
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
