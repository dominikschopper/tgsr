import { ref } from 'vue';
import type { Router } from 'vue-router';
import type { Player, Game } from '../../../shared/types.js';
import { getPlayerId } from '../../utils/storage.js';

interface LobbyLogicParams {
  router: Router;
  gameId: string;
  startGame: (gameId: string) => void;
}

export function useLobbyViewLogic({ router, gameId, startGame }: LobbyLogicParams) {
  const game = ref<Game | null>(null);
  const players = ref<Player[]>([]);
  const errorMessage = ref('');
  const myPlayerId = ref(getPlayerId() ?? '');

  function handleGameCreated(data: { gameId: string; playerId: string; game: Game }) {
    if (data.gameId === gameId) {
      game.value = data.game;
    }
  }

  function handleGameJoined(data: { gameId: string; playerId: string; game: Game }) {
    if (data.gameId === gameId) {
      game.value = data.game;
    }
  }

  function handleGameState(data: { game: Game }) {
    console.log('LobbyView: Received game_state', data.game);
    game.value = data.game;
  }

  function handlePlayerJoined(data: { player: Player }) {
    const existingIndex = players.value.findIndex(p => p.id === data.player.id);
    if (existingIndex === -1) {
      players.value.push(data.player);
    }
  }

  function handleGameStarted(data: { startedAt: number; endsAt: number }) {
    console.log('LobbyView: Game started, navigating to play view', data);
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
    handleGameCreated,
    handleGameJoined,
    handleGameState,
    handlePlayerJoined,
    handleGameStarted,
    handleError,
    handleStartGame,
    isHost
  };
}
