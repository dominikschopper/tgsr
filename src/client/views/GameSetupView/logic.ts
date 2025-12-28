import { ref } from 'vue';
import type { Router } from 'vue-router';
import type { GameVariant, Game, Player } from '../../../shared/types.js';
import { getPlayerName, setPlayerId, getPlayerId } from '../../utils/storage.js';
import { MIN_GAME_DURATION_MINUTES, MAX_GAME_DURATION_MINUTES } from '../../../shared/config.js';

interface GameSetupLogicParams {
  router: Router;
  createGame: (playerName: string, variant: GameVariant, durationMinutes: number) => void;
  startGame: (gameId: string) => void;
}

export function useGameSetupViewLogic({ router, createGame, startGame }: GameSetupLogicParams) {
  // Create game state
  const variant = ref<GameVariant>('sharpshooter');
  const durationMinutes = ref(2);
  const errorMessage = ref('');

  // Lobby state
  const gameCreated = ref(false);
  const game = ref<Game | null>(null);
  const players = ref<Player[]>([]);
  const myPlayerId = ref(getPlayerId() ?? '');

  // Generate duration options array
  const durationOptions = Array.from(
    { length: MAX_GAME_DURATION_MINUTES - MIN_GAME_DURATION_MINUTES + 1 },
    (_, i) => MIN_GAME_DURATION_MINUTES + i
  );

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

  function handleGameCreated(data: { gameId: string; playerId: string; game: Game }) {
    setPlayerId(data.playerId);
    myPlayerId.value = data.playerId;
    game.value = data.game;
    gameCreated.value = true;
  }

  function handlePlayerJoined(data: { player: Player }) {
    const existingIndex = players.value.findIndex(p => p.id === data.player.id);
    if (existingIndex === -1) {
      players.value.push(data.player);
    }
  }

  function handleGameStarted(data: { startedAt: number; endsAt: number }) {
    if (game.value) {
      console.log('GameSetupView: Game started, navigating to play view', data);
      router.push(`/play/${game.value.id}`);
    }
  }

  function handleError(data: { message: string }) {
    errorMessage.value = data.message;
  }

  function handleStartGame() {
    if (!game.value) return;
    errorMessage.value = '';
    startGame(game.value.id);
  }

  return {
    variant,
    durationMinutes,
    durationOptions,
    errorMessage,
    gameCreated,
    game,
    players,
    myPlayerId,
    handleCreateGame,
    handleGameCreated,
    handlePlayerJoined,
    handleGameStarted,
    handleError,
    handleStartGame
  };
}
