<template>
  <div class="container">
    <CreateGameForm
      v-if="!gameCreated"
      v-model:variant="variant"
      v-model:duration-minutes="durationMinutes"
      :duration-options="durationOptions"
      :error-message="errorMessage"
      @create="handleCreateGame"
      @back="router.push('/')"
    />

    <Lobby
      v-else
      :game="game"
      :players="players"
      :error-message="errorMessage"
      :is-host="game?.hostId === myPlayerId"
      @start="handleStartGame"
      @leave="router.push('/')"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../../composables/use-game-websocket';
import { useGameSetupViewLogic } from './logic';
import CreateGameForm from './components/CreateGameForm.vue';
import Lobby from './components/Lobby.vue';

const router = useRouter();
const { createGame, startGame, onEvent, offEvent } = useGameWebSocket();

const {
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
} = useGameSetupViewLogic({ router, createGame, startGame });

onMounted(() => {
  onEvent('game_created', handleGameCreated);
  onEvent('player_joined', handlePlayerJoined);
  onEvent('game_started', handleGameStarted);
  onEvent('error', handleError);
});

onUnmounted(() => {
  offEvent('game_created', handleGameCreated);
  offEvent('player_joined', handlePlayerJoined);
  offEvent('game_started', handleGameStarted);
  offEvent('error', handleError);
});
</script>
