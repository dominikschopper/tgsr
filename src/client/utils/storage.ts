const PLAYER_NAME_KEY = 'tgsr_player_name';

export function getPlayerName(): string | null {
  return localStorage.getItem(PLAYER_NAME_KEY);
}

export function setPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
}

export function clearPlayerName(): void {
  localStorage.removeItem(PLAYER_NAME_KEY);
}
