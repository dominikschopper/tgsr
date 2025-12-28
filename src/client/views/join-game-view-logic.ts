import { ref } from 'vue';
import type { Router } from 'vue-router';
import { getPlayerName } from '../utils/storage.js';

interface JoinGameLogicParams {
  router: Router;
  joinGame: (code: string, playerName: string) => void;
}

export function useJoinGameViewLogic({ router, joinGame }: JoinGameLogicParams) {
  const gameCode = ref('');
  const errorMessage = ref('');

  function handleJoinGame() {
    const playerName = getPlayerName();
    if (!playerName) {
      errorMessage.value = 'Player name not found. Please return to home.';
      return;
    }

    const code = gameCode.value.trim().toUpperCase();
    if (!code) {
      errorMessage.value = 'Please enter a game code';
      return;
    }

    if (code.length < 5) {
      errorMessage.value = 'Game code must be 6 characters';
      return;
    }

    errorMessage.value = '';
    joinGame(code, playerName);
  }

  function handleGameJoined(data: { gameId: string }) {
    router.push(`/lobby/${data.gameId}`);
  }

  function handleError(data: { message: string }) {
    errorMessage.value = data.message;
  }

  return {
    gameCode,
    errorMessage,
    handleJoinGame,
    handleGameJoined,
    handleError
  };
}
