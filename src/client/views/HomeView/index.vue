<template>
  <div class="container">
    <div class="card">
      <h2>Welcome to TGSR</h2>
      <p>HTML Tag Guesser - A competitive guessing game</p>

      <div class="form-group">
        <label for="playerName">Your Name</label>
        <input
          id="playerName"
          v-model="playerName"
          type="text"
          placeholder="Enter your name"
          maxlength="20"
          @keyup.enter="() => handleCreateGame(playerName)"
        />
      </div>

      <div class="button-group">
        <button @click="() => handleCreateGame(playerName)" :disabled="!playerName.trim()">
          Create Game
        </button>
        <button @click="() => handleJoinGame(playerName)" :disabled="!playerName.trim()" class="secondary">
          Join Game
        </button>
      </div>

      <div v-if="errorMessage" class="error-message mt-2">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getPlayerName } from '../../utils/storage';
import { useHomeViewLogic } from './logic';

const router = useRouter();
const playerName = ref('');

const { errorMessage, handleCreateGame, handleJoinGame } = useHomeViewLogic(router);

onMounted(() => {
  // Pre-fill player name from localStorage
  const savedName = getPlayerName();
  if (savedName) {
    playerName.value = savedName;
  }
});
</script>
