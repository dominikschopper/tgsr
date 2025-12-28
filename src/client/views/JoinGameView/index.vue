<template>
  <div class="container">
    <div class="card">
      <h2>Join Game</h2>

      <div class="form-group">
        <label for="gameId">Game ID</label>
        <input
          id="gameId"
          v-model="gameId"
          type="text"
          placeholder="e.g. ABC123"
          @keyup.enter="handleJoinGame"
          maxlength="6"
        />
        <p class="text-small mt-1">Enter the 6-character game ID</p>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="button-group">
        <button @click="handleJoinGame" :disabled="gameId.trim().length !== 6">
          Join Game
        </button>
        <button @click="() => router.push('/')" class="secondary">Back</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../../composables/use-game-websocket';
import { useJoinGameViewLogic } from './logic';

const router = useRouter();
const { joinGame, onEvent, offEvent } = useGameWebSocket();

const {
  gameId,
  errorMessage,
  handleJoinGame,
  handleGameJoined,
  handleError
} = useJoinGameViewLogic({ router, joinGame });

onMounted(() => {
  onEvent('game_joined', handleGameJoined);
  onEvent('error', handleError);
});

onUnmounted(() => {
  offEvent('game_joined', handleGameJoined);
  offEvent('error', handleError);
});
</script>

<style scoped>
.text-small {
  font-size: 0.875rem;
  color: #666;
}

#gameId {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
