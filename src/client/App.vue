<template>
  <div id="app">
    <header>
      <h1>TGSR - HTML Tag Guesser</h1>
      <div class="connection-status" :class="{ connected }">
        {{ connected ? '● Connected' : '○ Disconnected' }}
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer>
      <p>
        Open Source on
        <a href="https://github.com/dominikschopper/tgsr" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameWebSocket } from './composables/use-game-websocket';

const { connected, connect } = useGameWebSocket();

onMounted(() => {
  connect();
});
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #ddd;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.connection-status {
  font-size: 0.875rem;
  color: #999;
}

.connection-status.connected {
  color: #22c55e;
}

main {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

footer {
  text-align: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid #ddd;
  background-color: #f9fafb;
  margin-top: 2rem;
}

footer p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

footer a:hover {
  text-decoration: underline;
}
</style>
