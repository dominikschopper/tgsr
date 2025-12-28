<template>
  <div class="container">
    <div class="card">
      <!-- Game in progress view -->
      <div v-if="!gameEnded">
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
              :disabled="timeRemaining <= 0"
              autocomplete="off"
            />
            <button @click="handleSubmitTag" :disabled="!tagInput.trim() || timeRemaining <= 0">
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

      <!-- Results view -->
      <div v-else>
        <h2>Game Results</h2>

        <div v-if="getWinner()" class="winner-banner">
          🏆 {{ getWinner()!.playerName }} wins!
        </div>

        <div class="leaderboard">
          <div
            v-for="(player, index) in scores"
            :key="player.playerId"
            class="leaderboard-row"
            :class="{ winner: index === 0 }"
          >
            <div class="rank">{{ index + 1 }}</div>
            <div class="player-info">
              <div class="player-name">{{ player.playerName }}</div>
              <div class="player-score">
                {{ player.score }} {{ player.score === 1 ? 'point' : 'points' }}
              </div>
            </div>
            <div class="player-tags">
              <div class="tag-count">{{ player.tags.length }} tags</div>
              <div class="tag-list">
                <span v-for="tag in player.tags" :key="tag" class="tag-item">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="button-group">
          <button @click="handlePlayAgain">Play Again</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../../composables/use-game-websocket';
import { useGameViewLogic } from './logic';
import { getPlayerId } from '../../utils/storage';

const props = defineProps<{
  gameId: string;
}>();

const router = useRouter();
const { submitTag, getGameState, onEvent, offEvent } = useGameWebSocket();

const {
  tagInput,
  myTags,
  timeRemaining,
  errorMessage,
  feedbackMessage,
  gameEnded,
  scores,
  handleGameStarted,
  handleGameState,
  handleSubmitTag,
  handleTagSubmitted,
  handleTagInvalid,
  handleTagDuplicate,
  handleGameEnded,
  handleError,
  formatTime,
  isTimeWarning,
  cleanup
} = useGameViewLogic({ gameId: props.gameId, submitTag });

function getWinner() {
  if (scores.value.length === 0) return null;
  return scores.value[0] ?? null;
}

function handlePlayAgain() {
  router.push('/');
}

onMounted(() => {
  // Request current game state when component mounts
  const playerId = getPlayerId();
  if (playerId) {
    getGameState(props.gameId, playerId);
  }

  onEvent('game_state', handleGameState);
  onEvent('game_started', handleGameStarted);
  onEvent('tag_submitted', handleTagSubmitted);
  onEvent('tag_invalid', handleTagInvalid);
  onEvent('tag_duplicate', handleTagDuplicate);
  onEvent('game_ended', handleGameEnded);
  onEvent('error', handleError);
});

onUnmounted(() => {
  cleanup();
  offEvent('game_state', handleGameState);
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

/* Results view styles */
.winner-banner {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1f2937;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.leaderboard-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px solid transparent;
}

.leaderboard-row.winner {
  background: #fef3c7;
  border-color: #fbbf24;
}

.rank {
  font-size: 1.5rem;
  font-weight: bold;
  color: #6b7280;
  min-width: 2rem;
  text-align: center;
}

.leaderboard-row.winner .rank {
  color: #d97706;
}

.player-info {
  flex: 1;
  min-width: 150px;
}

.player-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.player-score {
  font-size: 0.875rem;
  color: #6b7280;
}

.player-tags {
  flex: 2;
}

.tag-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.leaderboard-row.winner .tag-item {
  background: #fbbf24;
  color: #78350f;
}

@media (max-width: 768px) {
  .leaderboard-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .rank {
    font-size: 1.25rem;
  }

  .player-info,
  .player-tags {
    width: 100%;
  }
}
</style>
