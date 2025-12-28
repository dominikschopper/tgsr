export const PLAYER_NAME_KEY = 'tgsr_player_name';
export const PLAYER_ID_KEY = 'tgsr_player_id';

export function getPlayerName(): string | null {
  return localStorage.getItem(PLAYER_NAME_KEY);
}

export function setPlayerName(name: string): void {
  if (!name || name.trim() === '') {
    localStorage.removeItem(PLAYER_NAME_KEY);
  } else {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  }
}

export function clearPlayerName(): void {
  localStorage.removeItem(PLAYER_NAME_KEY);
}

export function getPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function setPlayerId(id: string): void {
  localStorage.setItem(PLAYER_ID_KEY, id);
}

export function clearPlayerId(): void {
  localStorage.removeItem(PLAYER_ID_KEY);
}
