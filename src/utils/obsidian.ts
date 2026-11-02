const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

let vaultPath = '';
let apiKey = '';

export function setObsidianVaultPath(path: string) {
  vaultPath = path.trim();
}

export function setObsidianApiKey(key: string) {
  apiKey = key.trim();
}

export async function checkObsidianConnection(): Promise<boolean> {
  if (isElectron && vaultPath) {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.obsidian) {
      try {
        const result = await electronAPI.obsidian.checkVault(vaultPath);
        if (result.exists) {
          const notesResult = await electronAPI.obsidian.listNotes(vaultPath);
          return notesResult.success;
        }
        return false;
      } catch {
        return false;
      }
    }
  }
  return false;
}

export async function listObsidianNotes(): Promise<any[]> {
  if (isElectron && vaultPath) {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.obsidian) {
      try {
        const result = await electronAPI.obsidian.listNotes(vaultPath);
        return result.success ? result.notes : [];
      } catch {
        return [];
      }
    }
  }
  return [];
}

export async function searchObsidianNotes(query: string): Promise<any[]> {
  if (isElectron && vaultPath) {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.obsidian) {
      try {
        const result = await electronAPI.obsidian.searchNotes(vaultPath, query);
        return result.success ? result.results : [];
      } catch {
        return [];
      }
    }
  }
  return [];
}

export function generateObsidianUri(vaultName: string, noteName: string): string {
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(noteName)}`;
}

export function openInObsidian(vaultName: string, noteName: string): void {
  const uri = generateObsidianUri(vaultName, noteName);
  if (isElectron) {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.openExternal) {
      electronAPI.openExternal(uri);
      return;
    }
  }
  window.open(uri, '_blank');
}
