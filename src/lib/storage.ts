/**
 * Accesso a localStorage tollerante agli errori (navigazione privata,
 * storage bloccato): in caso di problemi si usa il valore di ripiego.
 */
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage non disponibile: la preferenza vale solo per la sessione */
  }
}
