import { ref } from 'vue';
import type { Router } from 'vue-router';
import type { Player, Game } from '../../shared/types.js';

interface LobbyLogicParams {
  router: Router;
  gameId: string;
  startGame: (gameId: string) => void;
}

export function useLobbyViewLogic({ router, gameId, startGame }: LobbyLogicParams) {
  const game = ref<Game | null>(null);
  const players = ref<Player[]>([]);
  const errorMessage = ref('');
  const myPlayerId = ref('');

  function handleGameJoined(data: { gameId: string; game: Game }) {
    if (data.gameId === gameId) {
      game.value = data.game;
    }
  }

  function handlePlayerJoined(data: { player: Player }) {
    const existingIndex = players.value.findIndex(p => p.id === data.player.id);
    if (existingIndex === -1) {
      players.value.push(data.player);
    }
  }

  function handleGameStarted() {
    router.push(`/play/${gameId}`);
  }

  function handleError(data: { message: string }) {
    errorMessage.value = data.message;
  }

  function handleStartGame() {
    errorMessage.value = '';
    startGame(gameId);
  }

  function isHost(): boolean {
    return game.value?.hostId === myPlayerId.value;
  }

  return {
    game,
    players,
    errorMessage,
    myPlayerId,
    handleGameJoined,
    handlePlayerJoined,
    handleGameStarted,
    handleError,
    handleStartGame,
    isHost
  };
}
