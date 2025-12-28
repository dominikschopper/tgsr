<template>
  <div class="container">
    <div class="card">
      <h2>Game in Progress</h2>

      <div class="timer" :class="{ warning: isTimeWarning(timeRemaining) }">
        {{ formatTime(timeRemaining) }}
      </div>

      <div class="form-group">
        <label for="tagInput">Enter HTML Tag</label>
        <div class="tag-input-group">
          <input
            id="tagInput"
            v-model="tagInput"
            type="text"
            placeholder="e.g., div, span, button"
            @keyup.enter="handleSubmitTag"
            :disabled="timeRemaining === 0"
            autocomplete="off"
          />
          <button @click="handleSubmitTag" :disabled="!tagInput.trim() || timeRemaining === 0">
            Submit
          </button>
        </div>

        <p v-if="feedbackMessage" class="feedback-message" :class="{
          success: feedbackMessage.startsWith('✓'),
          error: feedbackMessage.startsWith('✗')
        }">
          {{ feedbackMessage }}
        </p>
      </div>

      <div class="form-group">
        <h3>Your Tags ({{ myTags.length }})</h3>
        <div v-if="myTags.length === 0" class="text-small">
          No tags submitted yet
        </div>
        <div v-else class="tag-list">
          <span v-for="tag in myTags" :key="tag" class="tag-item">
            {{ tag }}
          </span>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../composables/use-game-websocket';
import { useGameViewLogic } from './game-view-logic';

const props = defineProps<{
  gameId: string;
}>();

const router = useRouter();
const { submitTag, onEvent, offEvent } = useGameWebSocket();

const {
  tagInput,
  myTags,
  timeRemaining,
  errorMessage,
  feedbackMessage,
  handleGameStarted,
  handleSubmitTag,
  handleTagSubmitted,
  handleTagInvalid,
  handleTagDuplicate,
  handleGameEnded,
  handleError,
  formatTime,
  isTimeWarning,
  cleanup
} = useGameViewLogic({ router, gameId: props.gameId, submitTag });

onMounted(() => {
  onEvent('game_started', handleGameStarted);
  onEvent('tag_submitted', handleTagSubmitted);
  onEvent('tag_invalid', handleTagInvalid);
  onEvent('tag_duplicate', handleTagDuplicate);
  onEvent('game_ended', handleGameEnded);
  onEvent('error', handleError);
});

onUnmounted(() => {
  cleanup();
  offEvent('game_started', handleGameStarted);
  offEvent('tag_submitted', handleTagSubmitted);
  offEvent('tag_invalid', handleTagInvalid);
  offEvent('tag_duplicate', handleTagDuplicate);
  offEvent('game_ended', handleGameEnded);
  offEvent('error', handleError);
});
</script>

<style scoped>
.tag-input-group {
  display: flex;
  gap: 0.5rem;
}

.tag-input-group input {
  flex: 1;
}

.tag-input-group button {
  min-width: 100px;
}

.feedback-message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.feedback-message.success {
  background: #d1fae5;
  color: #065f46;
}

.feedback-message.error {
  background: #fee2e2;
  color: #991b1b;
}
</style>
