import { ref } from 'vue';
import type { Router } from 'vue-router';
import type { GameVariant } from '../../shared/types.js';
import { getPlayerName } from '../utils/storage.js';
import { MIN_GAME_DURATION_MINUTES, MAX_GAME_DURATION_MINUTES } from '../../shared/config.js';

interface CreateGameLogicParams {
  router: Router;
  createGame: (playerName: string, variant: GameVariant, durationMinutes: number) => void;
}

export function useCreateGameViewLogic({ router, createGame }: CreateGameLogicParams) {
  const variant = ref<GameVariant>('sharpshooter');
  const durationMinutes = ref(2);
  const errorMessage = ref('');

  function handleCreateGame() {
    const playerName = getPlayerName();
    if (!playerName) {
      errorMessage.value = 'Player name not found. Please return to home.';
      return;
    }

    if (durationMinutes.value < MIN_GAME_DURATION_MINUTES || durationMinutes.value > MAX_GAME_DURATION_MINUTES) {
      errorMessage.value = `Duration must be between ${MIN_GAME_DURATION_MINUTES} and ${MAX_GAME_DURATION_MINUTES} minutes`;
      return;
    }

    errorMessage.value = '';
    createGame(playerName, variant.value, durationMinutes.value);
  }

  function handleGameCreated(data: { gameId: string; code: string; playerId: string }) {
    router.push(`/lobby/${data.gameId}`);
  }

  function handleError(data: { message: string }) {
    errorMessage.value = data.message;
  }

  // Generate duration options array
  const durationOptions = Array.from(
    { length: MAX_GAME_DURATION_MINUTES - MIN_GAME_DURATION_MINUTES + 1 },
    (_, i) => MIN_GAME_DURATION_MINUTES + i
  );

  return {
    variant,
    durationMinutes,
    durationOptions,
    errorMessage,
    handleCreateGame,
    handleGameCreated,
    handleError
  };
}
