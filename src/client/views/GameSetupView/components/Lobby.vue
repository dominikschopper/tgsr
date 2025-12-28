<template>
  <div class="card">
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
      <button v-if="isHost" @click="$emit('start')" :disabled="players.length < 2">
        Start Game
      </button>
      <p v-else class="text-center">Waiting for host to start the game...</p>
      <button @click="$emit('leave')" class="secondary">Leave Game</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Game, Player } from '../../../../shared/types';

defineProps<{
  game: Game | null;
  players: Player[];
  errorMessage: string;
  isHost: boolean;
}>();

defineEmits<{
  start: [];
  leave: [];
}>();
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
</style>
