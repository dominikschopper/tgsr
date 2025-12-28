import { ref } from 'vue';
import type { Router } from 'vue-router';
import { setPlayerName } from '../utils/storage.js';

export function useHomeViewLogic(router: Router) {
  const errorMessage = ref('');

  function handleCreateGame(playerName: string) {
    const name = playerName.trim();
    if (!name) {
      errorMessage.value = 'Please enter your name';
      return;
    }

    // Save name to localStorage
    setPlayerName(name);
    errorMessage.value = '';

    // Navigate to create game screen
    router.push('/game');
  }

  function handleJoinGame(playerName: string) {
    const name = playerName.trim();
    if (!name) {
      errorMessage.value = 'Please enter your name';
      return;
    }

    // Save name to localStorage
    setPlayerName(name);
    errorMessage.value = '';

    // Navigate to join game screen
    router.push('/join');
  }

  return {
    errorMessage,
    handleCreateGame,
    handleJoinGame
  };
}
