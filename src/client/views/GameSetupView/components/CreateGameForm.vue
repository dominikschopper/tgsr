<template>
  <div class="card">
    <h2>Create a Game</h2>

    <div class="form-group">
      <label for="variant">Choose a game variant</label>
      <div class="radio-group">
        <label>
          <div class="radio-option">
            <input type="radio" v-model="variant" value="sharpshooter" />
            <span class="variant-name">Sharpshooter</span>
          </div>
          <small class="variant-description">
            For each tag you guess, you earn as many points as there are players.
            However, for each other player who also guessed the same tag, you lose one point.
            Unique tags score highest!
          </small>
        </label>
        <label>
          <div class="radio-option">
            <input type="radio" v-model="variant" value="quickdraw" />
            <span class="variant-name">Quickdraw</span>
          </div>
          <small class="variant-description">
            As soon as you guess a tag, all players can see it and nobody can use this tag to sscore.
            Speed matters! Be the first to claim the most tags.
          </small>
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
      <button @click="$emit('create')">Create Game</button>
      <button @click="$emit('back')" class="secondary">Back</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameVariant } from '../../../../shared/types';

defineProps<{
  variant: GameVariant;
  durationMinutes: number;
  durationOptions: number[];
  errorMessage: string;
}>();

defineEmits<{
  create: [];
  back: [];
}>();

const variant = defineModel<GameVariant>('variant', { required: true });
const durationMinutes = defineModel<number>('durationMinutes', { required: true });
</script>

<style scoped>
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-group label {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-group label:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.radio-option {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.radio-group input[type="radio"] {
  margin-right: 0.75rem;
  cursor: pointer;
}

.variant-name {
  font-weight: 600;
  font-size: 1rem;
}

.variant-description {
  display: block;
  color: #6b7280;
  font-size: 0.8125rem;
  line-height: 1.5;
  padding-left: 1.75rem;
}
</style>
