import { ref } from 'vue';
import type { Router } from 'vue-router';
import { formatTime, calculateTimeRemaining, isTimeWarning } from '../utils/timer.js';

interface GameLogicParams {
  router: Router;
  gameId: string;
  submitTag: (gameId: string, tag: string) => void;
}

export function useGameViewLogic({ router, gameId, submitTag }: GameLogicParams) {
  const tagInput = ref('');
  const myTags = ref<string[]>([]);
  const allTags = ref<Map<string, string[]>>(new Map()); // playerId -> tags (for quickdraw)
  const timeRemaining = ref(0);
  const endsAt = ref(0);
  const errorMessage = ref('');
  const feedbackMessage = ref('');
  const variant = ref<'sharpshooter' | 'quickdraw'>('sharpshooter');

  let timerInterval: number | null = null;

  function handleGameStarted(data: { startedAt: number; endsAt: number }) {
    endsAt.value = data.endsAt;
    timeRemaining.value = calculateTimeRemaining(data.endsAt);

    // Start timer countdown
    timerInterval = window.setInterval(() => {
      timeRemaining.value = calculateTimeRemaining(endsAt.value);
      if (timeRemaining.value === 0 && timerInterval) {
        clearInterval(timerInterval);
      }
    }, 100);
  }

  function handleSubmitTag() {
    const tag = tagInput.value.trim().toLowerCase();

    if (!tag) {
      feedbackMessage.value = '';
      return;
    }

    if (timeRemaining.value === 0) {
      feedbackMessage.value = 'Time is up!';
      return;
    }

    submitTag(gameId, tag);
    tagInput.value = '';
    feedbackMessage.value = '';
  }

  function handleTagSubmitted(data: { playerId: string; playerName?: string; tag: string }) {
    if (!myTags.value.includes(data.tag)) {
      myTags.value.push(data.tag);
      feedbackMessage.value = `✓ ${data.tag} submitted!`;
    }

    // For quickdraw, track all submissions
    if (variant.value === 'quickdraw' && data.playerName) {
      const playerTags = allTags.value.get(data.playerId) || [];
      if (!playerTags.includes(data.tag)) {
        playerTags.push(data.tag);
        allTags.value.set(data.playerId, playerTags);
      }
    }

    // Clear feedback after 2 seconds
    setTimeout(() => {
      feedbackMessage.value = '';
    }, 2000);
  }

  function handleTagInvalid(data: { tag: string }) {
    feedbackMessage.value = `✗ "${data.tag}" is not a valid HTML tag`;
    setTimeout(() => {
      feedbackMessage.value = '';
    }, 3000);
  }

  function handleTagDuplicate(data: { tag: string }) {
    feedbackMessage.value = `✗ You already submitted "${data.tag}"`;
    setTimeout(() => {
      feedbackMessage.value = '';
    }, 3000);
  }

  function handleGameEnded() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    router.push(`/results/${gameId}`);
  }

  function handleError(data: { message: string }) {
    errorMessage.value = data.message;
  }

  function cleanup() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  return {
    tagInput,
    myTags,
    allTags,
    timeRemaining,
    errorMessage,
    feedbackMessage,
    variant,
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
  };
}
