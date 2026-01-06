// Server configuration
export const SERVER_HOST = typeof process !== 'undefined' ? process.env?.SERVER_HOST || 'localhost' : 'localhost';
export const SERVER_PORT = typeof process !== 'undefined' && process.env?.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 8642;
export const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

// Client configuration
// In production, Socket.io connects to the same origin (empty string)
// In development, use VITE_WS_URL or fallback to localhost:8642
// @ts-ignore - import.meta.env is available in Vite
const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
// @ts-ignore
const viteWsUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL;
export const WS_URL = isDevelopment ? (viteWsUrl || 'http://localhost:8642') : '';

// Game configuration
export const MIN_GAME_DURATION_MINUTES = 1;
export const MAX_GAME_DURATION_MINUTES = 5;
export const MIN_PLAYERS = 2;
