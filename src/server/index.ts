// server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' } // Configure properly for production
});

// In-memory storage (lost on restart - that's OK!)
const games = new Map<string, Game>();
const players = new Map<string, Player>();

interface Game {
  id: string;
  code: string;
  hostId: string;
  variant: 'sharpshooter' | 'quickdraw';
  durationMinutes: number;
  status: 'waiting' | 'active' | 'finished';
  startedAt?: number;
  endsAt?: number;
  players: string[]; // player IDs
  submissions: Map<string, string[]>; // playerId -> tags
}

interface Player {
  id: string;
  name: string;
  gameId: string;
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create game
  socket.on('create_game', ({ playerName, variant, durationMinutes }) => {
    const gameId = nanoid(10);
    const code = nanoid(6).toUpperCase();
    const playerId = socket.id;

    const game: Game = {
      id: gameId,
      code,
      hostId: playerId,
      variant,
      durationMinutes,
      status: 'waiting',
      players: [playerId],
      submissions: new Map()
    };

    const player: Player = {
      id: playerId,
      name: playerName,
      gameId
    };

    games.set(gameId, game);
    players.set(playerId, player);

    socket.join(gameId);
    socket.emit('game_created', { gameId, code, playerId });
  });

  // Join game
  socket.on('join_game', ({ code, playerName }) => {
    const game = Array.from(games.values()).find(g => g.code === code);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.status !== 'waiting') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    const playerId = socket.id;
    const player: Player = {
      id: playerId,
      name: playerName,
      gameId: game.id
    };

    game.players.push(playerId);
    players.set(playerId, player);

    socket.join(game.id);

    // Notify everyone in the game
    io.to(game.id).emit('player_joined', { player });
    socket.emit('game_joined', { gameId: game.id, game });
  });

  // Start game
  socket.on('start_game', ({ gameId }) => {
    const game = games.get(gameId);

    if (!game || game.hostId !== socket.id) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }

    game.status = 'active';
    game.startedAt = Date.now();
    game.endsAt = Date.now() + game.durationMinutes * 60 * 1000;

    io.to(gameId).emit('game_started', {
      startedAt: game.startedAt,
      endsAt: game.endsAt
    });

    // Auto-end game after duration
    setTimeout(() => {
      game.status = 'finished';
      const scores = calculateScores(game);
      io.to(gameId).emit('game_ended', { scores });
    }, game.durationMinutes * 60 * 1000);
  });

  // Submit tag
  socket.on('submit_tag', ({ gameId, tag }) => {
    const game = games.get(gameId);
    const player = players.get(socket.id);

    if (!game || !player || game.status !== 'active') {
      socket.emit('error', { message: 'Invalid game state' });
      return;
    }

    // Validate tag
    if (!isValidHTMLTag(tag)) {
      socket.emit('tag_invalid', { tag });
      return;
    }

    // Check if already submitted
    const playerTags = game.submissions.get(socket.id) || [];
    if (playerTags.includes(tag)) {
      socket.emit('tag_duplicate', { tag });
      return;
    }

    // Add submission
    playerTags.push(tag);
    game.submissions.set(socket.id, playerTags);

    // Notify based on variant
    if (game.variant === 'quickdraw') {
      // Show to everyone
      io.to(gameId).emit('tag_submitted', {
        playerId: socket.id,
        playerName: player.name,
        tag
      });
    } else {
      // Sharpshooter: only confirm to submitter
      socket.emit('tag_submitted', {
        playerId: socket.id,
        tag
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Could handle cleanup here, but not critical for ephemeral games
  });
});

function calculateScores(game: Game) {
  // Implementation of scoring logic
  // ...
}

function isValidHTMLTag(tag: string): boolean {
  // Use your HTML_TAGS list
  return HTML_TAGS.includes(tag.toLowerCase());
}

httpServer.listen(3000, () => {
  console.log('Server running on port 3000');
});
Frontend (Vue 3 + Socket.io Client)

// src/composables/useGameWebSocket.ts
import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

const socket = ref<Socket | null>(null);
const connected = ref(false);

export function useGameWebSocket() {
  function connect() {
    socket.value = io('http://localhost:3000'); // Or your deployed URL

    socket.value.on('connect', () => {
      connected.value = true;
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
    });
  }

  function createGame(playerName: string, variant: string, durationMinutes: number) {
    socket.value?.emit('create_game', { playerName, variant, durationMinutes });
  }

  function joinGame(code: string, playerName: string) {
    socket.value?.emit('join_game', { code, playerName });
  }

  function startGame(gameId: string) {
    socket.value?.emit('start_game', { gameId });
  }

  function submitTag(gameId: string, tag: string) {
    socket.value?.emit('submit_tag', { gameId, tag });
  }

  function onEvent(event: string, callback: Function) {
    socket.value?.on(event, callback);
  }

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  return {
    connected,
    connect,
    createGame,
    joinGame,
    startGame,
    submitTag,
    onEvent
  };
}
