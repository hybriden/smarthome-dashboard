const PREFIX = "smarthome-";
const API_URL = "/api/settings";
const DEBOUNCE_MS = 300;

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function buildSettingsObject(): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    const cleanKey = key.slice(PREFIX.length);
    try {
      settings[cleanKey] = JSON.parse(localStorage.getItem(key) ?? "");
    } catch {
      settings[cleanKey] = null;
    }
  }
  return settings;
}

function debouncedSync(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSettingsObject()),
      });
    } catch {
      // Silent fail — localStorage is still the local cache
    }
  }, DEBOUNCE_MS);
}

/** Call once at app startup to load server settings into localStorage */
export async function initStorage(): Promise<void> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return;
    const data: Record<string, unknown> = await res.json();
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {
    // Server unavailable — fall back to existing localStorage
  }
}

export function saveJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
  debouncedSync();
}

export function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key);
  debouncedSync();
}
