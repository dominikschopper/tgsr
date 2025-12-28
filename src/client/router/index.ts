import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CreateGameView from '../views/CreateGameView.vue';
import JoinGameView from '../views/JoinGameView.vue';
import LobbyView from '../views/LobbyView.vue';
import GameView from '../views/GameView.vue';
import ResultsView from '../views/ResultsView.vue';

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
      component: CreateGameView
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
      // Lobby = waiting room where players gather before game starts
      // Host can see "Start Game" button, others wait
      // Shows game code, variant, duration, and player list
    },
    {
      path: '/play/:gameId',
      name: 'play',
      component: GameView,
      props: true,
      // Active game where players submit HTML tags
    },
    {
      path: '/results/:gameId',
      name: 'results',
      component: ResultsView,
      props: true
    }
  ]
});

export default router;
