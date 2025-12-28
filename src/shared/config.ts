// Server configuration
export const SERVER_HOST = typeof process !== 'undefined' ? process.env?.SERVER_HOST || 'localhost' : 'localhost';
export const SERVER_PORT = typeof process !== 'undefined' && process.env?.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;
export const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

// Client configuration - will use Vite's environment variables
// @ts-ignore - import.meta.env is available in Vite
export const WS_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) || SERVER_URL;

// Game configuration
export const MIN_GAME_DURATION_MINUTES = 1;
export const MAX_GAME_DURATION_MINUTES = 5;
export const MIN_PLAYERS = 2;
