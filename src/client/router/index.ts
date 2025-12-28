import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView/index.vue';
import GameSetupView from '../views/GameSetupView/index.vue';
import JoinGameView from '../views/JoinGameView/index.vue';
import LobbyView from '../views/LobbyView/index.vue';
import GameView from '../views/GameView/index.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/game',
      name: 'create',
      component: GameSetupView
    },
    {
      path: '/join',
      name: 'join',
      component: JoinGameView
    },
    {
      path: '/lobby/:gameId',
      name: 'lobby',
      component: LobbyView,
      props: true,
      // Lobby = waiting room where players join an existing game
      // Shows game code, variant, duration, and player list
    },
    {
      path: '/play/:gameId',
      name: 'play',
      component: GameView,
      props: true,
      // Active game where players submit HTML tags, then shows results when game ends
    }
  ]
});

export default router;
