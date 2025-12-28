<template>
  <div class="container">
    <!-- Create Game Form -->
    <div v-if="!gameCreated" class="card">
      <h2>Create Game</h2>

      <div class="form-group">
        <label for="variant">Game Variant</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="variant" value="sharpshooter" />
            <span>Sharpshooter</span>
            <small>Secret tags, unique = more points</small>
          </label>
          <label>
            <input type="radio" v-model="variant" value="quickdraw" />
            <span>Quickdraw</span>
            <small>Visible tags, first = only points</small>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="duration">Duration</label>
        <select id="duration" v-model="durationMinutes">
          <option v-for="minutes in durationOptions" :key="minutes" :value="minutes">
            {{ minutes }} {{ minutes === 1 ? 'minute' : 'minutes' }}
          </option>
        </select>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="button-group">
        <button @click="handleCreateGame">Create Game</button>
        <button @click="() => router.push('/')" class="secondary">Back</button>
      </div>
    </div>

    <!-- Lobby -->
    <div v-else class="card">
      <h2>Game Lobby</h2>

      <div v-if="game" class="game-info">
        <div class="game-code">{{ game.id }}</div>
        <p class="text-center">Share this game ID with other players</p>

        <div class="game-details mt-2">
          <p><strong>Variant:</strong> {{ game.variant === 'sharpshooter' ? 'Sharpshooter' : 'Quickdraw' }}</p>
          <p><strong>Duration:</strong> {{ game.durationMinutes }} {{ game.durationMinutes === 1 ? 'minute' : 'minutes' }}</p>
        </div>
      </div>

      <div class="form-group">
        <h3>Players ({{ players.length }})</h3>
        <ul class="player-list">
          <li v-for="player in players" :key="player.id" class="player-list-item">
            <span>{{ player.name }}</span>
            <span v-if="game && player.id === game.hostId" class="host-badge">Host</span>
          </li>
        </ul>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="button-group">
        <button v-if="game?.hostId === myPlayerId" @click="handleStartGame" :disabled="players.length < 2">
          Start Game
        </button>
        <p v-else class="text-center">Waiting for host to start the game...</p>
        <button @click="() => router.push('/')" class="secondary">Leave Game</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../../composables/use-game-websocket';
import { useGameSetupViewLogic } from './logic';

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

<style scoped>
.game-info {
  text-align: center;
  margin-bottom: 2rem;
}

.game-details {
  text-align: left;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 4px;
}

.game-details p {
  margin: 0.5rem 0;
}

.host-badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
}

.radio-group label:hover {
  background: #f9fafb;
}

.radio-group input[type="radio"] {
  margin-right: 0.75rem;
}

.radio-group span {
  font-weight: 500;
}

.radio-group small {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
