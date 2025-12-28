<template>
  <div class="card">
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
