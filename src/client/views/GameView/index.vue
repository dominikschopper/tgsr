<template>
  <div class="container">
    <ActiveGame
      v-if="!gameEnded"
      v-model:tag-input="tagInput"
      :my-tags="myTags"
      :time-remaining="timeRemaining"
      :error-message="errorMessage"
      :feedback-message="feedbackMessage"
      :format-time="formatTime"
      :is-time-warning="isTimeWarning"
      @submit="handleSubmitTag"
    />

    <Results
      v-else
      :scores="scores"
      @play-again="handlePlayAgain"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameWebSocket } from '../../composables/use-game-websocket';
import { useGameViewLogic } from './logic';
import { getPlayerId } from '../../utils/storage';
import ActiveGame from './components/ActiveGame.vue';
import Results from './components/Results.vue';

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
