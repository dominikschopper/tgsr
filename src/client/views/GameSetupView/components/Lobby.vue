<template>
  <div class="card">
    <h2>Game Lobby</h2>

    <div v-if="game" class="game-info">
      <div class="game-code-container">
        <div class="game-code" :class="{ copied: isCopied }">{{ game.id }}</div>
        <button @click="copyGameId" class="copy-button" :class="{ copied: isCopied }">
          <span>Copy</span>
          <span class="material-symbols-outlined icon">{{ isCopied ? 'check' : 'content_copy' }}</span>
        </button>
      </div>
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
      <button v-if="isHost" @click="$emit('start')" :disabled="players.length < MIN_PLAYERS">
        Start Game
      </button>
      <p v-else class="text-center">Waiting for host to start the game...</p>
      <button @click="$emit('leave')" class="secondary">Leave Game</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Game, Player } from '../../../../shared/types';
import { MIN_PLAYERS } from '../../../../shared/config';

const props = defineProps<{
  game: Game | null;
  players: Player[];
  errorMessage: string;
  isHost: boolean;
}>();

defineEmits<{
  start: [];
  leave: [];
}>();

const isCopied = ref(false);

const copyGameId = async () => {
  if (!props.game) return;

  try {
    await navigator.clipboard.writeText(props.game.id);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy game ID:', err);
  }
};
</script>

<style scoped>
.game-info {
  text-align: center;
  margin-bottom: 2rem;
}

.game-code-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.game-code {
  border: 2px solid #3b82f6;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.game-code.copied {
  border-color: #10b981;
  background: #d1fae5;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 90px;
}

.copy-button .icon {
  font-size: 1.125rem;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
}

.copy-button.copied .icon {
  transform: scale(1.2);
}

.copy-button:hover {
  background: #2563eb;
}

.copy-button.copied {
  background: #10b981;
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
