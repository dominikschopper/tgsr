import { ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import type { GameVariant } from '../../shared/types.js';
import { WS_URL } from '../../shared/config.js';

// Singleton socket instance shared across all components
const socket = ref<Socket | null>(null);
const connected = ref(false);

export function useGameWebSocket() {
  function connect() {
    // Only create socket if it doesn't exist yet
    if (!socket.value) {
      socket.value = io(WS_URL);

      socket.value.on('connect', () => {
        console.log('WebSocket connected with id:', socket.value?.id);
        connected.value = true;
      });

      socket.value.on('disconnect', () => {
        console.log('WebSocket disconnected');
        connected.value = false;
      });
    }
  }

  function disconnect() {
    socket.value?.disconnect();
    socket.value = null;
    connected.value = false;
  }

  function createGame(playerName: string, variant: GameVariant, durationMinutes: number) {
    socket.value?.emit('create_game', { playerName, variant, durationMinutes });
  }

  function joinGame(gameId: string, playerName: string) {
    socket.value?.emit('join_game', { gameId, playerName });
  }

  function startGame(gameId: string) {
    socket.value?.emit('start_game', { gameId });
  }

  function submitTag(gameId: string, tag: string) {
    socket.value?.emit('submit_tag', { gameId, tag });
  }

  function getGameState(gameId: string, playerId: string) {
    socket.value?.emit('get_game_state', { gameId, playerId });
  }

  function onEvent(event: string, callback: (data: any) => void) {
    socket.value?.on(event, callback);
  }

  function offEvent(event: string, callback?: (data: any) => void) {
    if (callback) {
      socket.value?.off(event, callback);
    } else {
      socket.value?.off(event);
    }
  }

  return {
    connected,
    connect,
    disconnect,
    createGame,
    joinGame,
    startGame,
    submitTag,
    getGameState,
    onEvent,
    offEvent
  };
}