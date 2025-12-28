import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import type { GameVariant } from '../../shared/types.js';
import { WS_URL } from '../../shared/config.js';

const socket = ref<Socket | null>(null);
const connected = ref(false);

export function useGameWebSocket() {
  function connect() {
    socket.value = io(WS_URL);

    socket.value.on('connect', () => {
      connected.value = true;
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
    });
  }

  function createGame(playerName: string, variant: GameVariant, durationMinutes: number) {
    socket.value?.emit('create_game', { playerName, variant, durationMinutes });
  }

  function joinGame(code: string, playerName: string) {
    socket.value?.emit('join_game', { code, playerName });
  }

  function startGame(gameId: string) {
    socket.value?.emit('start_game', { gameId });
  }

  function submitTag(gameId: string, tag: string) {
    socket.value?.emit('submit_tag', { gameId, tag });
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

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  return {
    connected,
    connect,
    createGame,
    joinGame,
    startGame,
    submitTag,
    onEvent,
    offEvent
  };
}