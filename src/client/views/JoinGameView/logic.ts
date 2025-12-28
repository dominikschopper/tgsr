import { ref } from 'vue';
import type { Router } from 'vue-router';
import { getPlayerName, setPlayerId } from '../../utils/storage.js';

interface JoinGameLogicParams {
  router: Router;
  joinGame: (gameId: string, playerName: string) => void;
}

export function useJoinGameViewLogic({ router, joinGame }: JoinGameLogicParams) {
  const gameId = ref('');
  const errorMessage = ref('');

  function handleJoinGame() {
    const playerName = getPlayerName();
    if (!playerName) {
      errorMessage.value = 'Player name not found. Please return to home.';
      return;
    }

    const id = gameId.value.trim().toUpperCase();
    if (!id) {
      errorMessage.value = 'Please enter a game ID';
      return;
    }

    if (id.length !== 6) {
      errorMessage.value = 'Game ID must be 6 characters';
      return;
    }

    errorMessage.value = '';
    joinGame(id, playerName);
  }

  function handleGameJoined(data: { gameId: string; playerId: string }) {
    setPlayerId(data.playerId);
    router.push(`/lobby/${data.gameId}`);
  }

  function handleError(data: { message: string }) {
    errorMessage.value = data.message;
  }

  return {
    gameId,
    errorMessage,
    handleJoinGame,
    handleGameJoined,
    handleError
  };
}
