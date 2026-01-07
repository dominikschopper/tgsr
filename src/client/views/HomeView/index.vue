<template>
  <div class="container">
    <div class="card">
      <h2>Welcome to TGSR (Tag Guesser)</h2>
      <p>HTML Tag Guesser - A competitive guessing game</p>

      <p>
        This is a place to test your HTML knowledge. Play a game of <em>who knows the most tags?</em>, either alone or together with others.
      </p>
      <ul>
        <li>enter a gamer tag/name</li>
        <li>create a game or join someone elses game</li>
        <li>compete</li>
      </ul>

      <div class="form-group">
        <label for="playerName">Set a gamer tag</label>
        <input
          id="playerName"
          v-model="playerName"
          type="text"
          placeholder="Enter your name"
          maxlength="20"
          autocomplete="off"
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
<style scoped>
  p{
    margin-bottom: .5rem;
  }
  ul,li {
    list-style-type: square;
  }
  li{
    margin-left: .5rem;
    list-style-position: inside;
  }
</style>