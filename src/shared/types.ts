// Game types
export type GameVariant = 'sharpshooter' | 'quickdraw';
export type GameStatus = 'waiting' | 'active' | 'finished';

export interface Game {
  id: string;
  hostId: string;
  variant: GameVariant;
  durationMinutes: number;
  status: GameStatus;
  startedAt?: number;
  endsAt?: number;
  players: string[]; // player IDs
  submissions: Record<string, string[]>; // playerId -> tags (serialized from Map)
  scores?: PlayerScore[]; // Final scores when game is finished
}

export interface Player {
  id: string;
  name: string;
  gameId: string;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
  tags: string[];
  uniqueTags?: number; // For quickdraw variant
}

// WebSocket event payloads
export interface CreateGamePayload {
  playerName: string;
  variant: GameVariant;
  durationMinutes: number;
}

export interface JoinGamePayload {
  gameId: string;
  playerName: string;
}

export interface StartGamePayload {
  gameId: string;
}

export interface SubmitTagPayload {
  gameId: string;
  tag: string;
}

export interface GameCreatedResponse {
  gameId: string;
  playerId: string;
}

export interface GameJoinedResponse {
  gameId: string;
  game: Game;
}

export interface PlayerJoinedEvent {
  player: Player;
}

export interface GameStartedEvent {
  startedAt: number;
  endsAt: number;
}

export interface TagSubmittedEvent {
  playerId: string;
  playerName?: string;
  tag: string;
}

export interface GameEndedEvent {
  scores: PlayerScore[];
}

export interface ErrorEvent {
  message: string;
}
