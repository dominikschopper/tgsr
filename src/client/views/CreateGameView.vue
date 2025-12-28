<template>
  <div class="container">
    <div class="card">
      <h2>Create Game</h2>

      <div class="form-group">
        <label>Game Variant</label>
        <div class="radio-group">
          <label class="radio-option" :class="{ selected: variant === 'sharpshooter' }">
            <input type="radio" value="sharpshooter" v-model="variant" />
            <div>
              <strong>Sharpshooter</strong>
              <p class="text-small">Unique tags score higher</p>
            </div>
          </label>
          <label class="radio-option" :class="{ selected: variant === 'quickdraw' }">
            <input type="radio" value="quickdraw" v-model="variant" />
            <div>
              <strong>Quickdraw</strong>
              <p class="text-small">First to submit wins</p>
            </div>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="duration">Duration (minutes)</label>
        <select id="duration" v-model.number="durationMinutes">
          <option v-for="duration in durationOptions" :key="duration" :value="duration">
            {{ duration }} {{ duration === 1 ? 'minute' : 'minutes' }}
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../composables/use-game-websocket';
import { useCreateGameViewLogic } from './create-game-view-logic';

const router = useRouter();
const { createGame, onEvent, offEvent } = useGameWebSocket();

const {
  variant,
  durationMinutes,
  durationOptions,
  errorMessage,
  handleCreateGame,
  handleGameCreated,
  handleError
} = useCreateGameViewLogic({ router, createGame });

onMounted(() => {
  onEvent('game_created', handleGameCreated);
  onEvent('error', handleError);
});

onUnmounted(() => {
  offEvent('game_created', handleGameCreated);
  offEvent('error', handleError);
});
</script>

<style scoped>
.text-small {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
