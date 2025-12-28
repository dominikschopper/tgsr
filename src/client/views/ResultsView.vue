<template>
  <div class="container">
    <div class="card">
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

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="button-group">
        <button @click="handlePlayAgain">Play Again</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../composables/use-game-websocket';
import { useResultsViewLogic } from './results-view-logic';

const props = defineProps<{
  gameId: string;
}>();

const router = useRouter();
const { onEvent, offEvent } = useGameWebSocket();

const {
  scores,
  errorMessage,
  handleGameEnded,
  handleError,
  handlePlayAgain,
  getWinner
} = useResultsViewLogic({ router, gameId: props.gameId });

onMounted(() => {
  onEvent('game_ended', handleGameEnded);
  onEvent('error', handleError);
});

onUnmounted(() => {
  offEvent('game_ended', handleGameEnded);
  offEvent('error', handleError);
});
</script>

<style scoped>
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

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-item {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
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
