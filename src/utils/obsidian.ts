/**
 * Obsidian Local REST API Integration
 * 
 * Requires the "Local REST API" plugin installed in Obsidian.
 * Plugin: https://github.com/coddingtonbear/obsidian-local-rest-api
 * 
 * Default endpoint: https://127.0.0.1:27124
 */

const OBSIDIAN_API_BASE = 'https://127.0.0.1:27124';

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
      // Self-signed cert, so we need to handle this
      headers: { 'Accept': 'application/json' },
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
        headers: { 'Accept': 'application/json' },
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
    const response = await fetch(
      `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(path)}`,
      {
        method: 'GET',
        headers: { 'Accept': 'text/markdown' },
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
    const response = await fetch(
      `${OBSIDIAN_API_BASE}/vault/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/markdown',
          'Accept': 'application/json',
        },
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
        headers: { 'Accept': 'application/json' },
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
