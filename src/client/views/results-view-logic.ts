import { ref } from 'vue';
import type { Router } from 'vue-router';
import type { PlayerScore } from '../../shared/types.js';

interface ResultsLogicParams {
  router: Router;
  gameId: string;
}

export function useResultsViewLogic({ router, gameId }: ResultsLogicParams) {
  const scores = ref<PlayerScore[]>([]);
  const errorMessage = ref('');
  const variant = ref<'sharpshooter' | 'quickdraw'>('sharpshooter');

  function handleGameEnded(data: {
    scores: PlayerScore[];
    variant: 'sharpshooter' | 'quickdraw';
  }) {
    scores.value = data.scores;
    variant.value = data.variant;
  }

  function handleError(data: { message: string }) {
    errorMessage.value = data.message;
  }

  function handlePlayAgain() {
    router.push('/');
  }

  function getWinner(): PlayerScore | null {
    if (scores.value.length === 0) return null;
    return scores.value[0] ?? null; // Scores are already sorted by backend
  }

  return {
    scores,
    errorMessage,
    variant,
    handleGameEnded,
    handleError,
    handlePlayAgain,
    getWinner
  };
}
