import { ref } from 'vue';
import { formatTime, calculateTimeRemaining, isTimeWarning } from '../../utils/timer.js';

interface GameLogicParams {
  gameId: string;
  submitTag: (gameId: string, tag: string) => void;
}

export function useGameViewLogic({ gameId, submitTag }: GameLogicParams) {
  const tagInput = ref('');
  const myTags = ref<string[]>([]);
  const allTags = ref<Map<string, string[]>>(new Map()); // playerId -> tags (for quickdraw)
  const timeRemaining = ref(0);
  const endsAt = ref(0);
  const errorMessage = ref('');
  const feedbackMessage = ref('');
  const variant = ref<'sharpshooter' | 'quickdraw'>('sharpshooter');
  const gameEnded = ref(false);
  const scores = ref<any[]>([]);

  let timerInterval: number | null = null;

  function startTimer(endTime: number) {
    endsAt.value = endTime;
    timeRemaining.value = calculateTimeRemaining(endTime);

    // Clear existing interval if any
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Start timer countdown
    timerInterval = window.setInterval(() => {
      timeRemaining.value = calculateTimeRemaining(endsAt.value);
      if (timeRemaining.value === 0 && timerInterval) {
        clearInterval(timerInterval);
      }
    }, 100);
  }

  function handleGameStarted(data: { startedAt: number; endsAt: number }) {
    startTimer(data.endsAt);
  }

  function handleGameState(data: { game: any }) {
    console.log('GameView: Received game_state', data.game);
    // Initialize game state when we receive it
    if (data.game.status === 'active' && data.game.endsAt) {
      console.log('GameView: Starting timer with endsAt:', data.game.endsAt);
      startTimer(data.game.endsAt);
      variant.value = data.game.variant;
    } else {
      console.log('GameView: Game not active or no endsAt', { status: data.game.status, endsAt: data.game.endsAt });
    }
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

    // Quickdraw: Check if tag already taken by any player
    if (variant.value === 'quickdraw') {
      const allSubmittedTags = Array.from(allTags.value.values()).flat();
      if (allSubmittedTags.includes(tag)) {
        feedbackMessage.value = `✗ "${tag}" already taken by another player`;
        setTimeout(() => {
          feedbackMessage.value = '';
        }, 3000);
        tagInput.value = '';
        return;
      }
    }

    submitTag(gameId, tag);
    tagInput.value = '';
    feedbackMessage.value = '';
  }

  function handleTagSubmitted(data: { playerId: string; playerName?: string; tag: string }) {
    // Add to my tags list (only updates if this is my tag submission)
    if (!myTags.value.includes(data.tag)) {
      myTags.value.push(data.tag);
    }

    feedbackMessage.value = `✓ ${data.tag} submitted!`;

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

  function handleGameEnded(data?: { scores: any[] }) {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    console.log('Game ended, showing results...', data);
    if (data?.scores) {
      scores.value = data.scores;
      gameEnded.value = true;
    }
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
  };
}
