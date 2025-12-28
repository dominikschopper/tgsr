// server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { isValidHTMLTag } from '../shared/html-tags.js';
import type { Game as GameType, Player, PlayerScore } from '../shared/types.js';
import { calculateSharpshooterScores, calculateQuickdrawScores } from './scoring.js';
import { SERVER_PORT, MIN_GAME_DURATION_MINUTES, MAX_GAME_DURATION_MINUTES, MIN_PLAYERS } from '../shared/config.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' } // Configure properly for production
});

// Serve static files in production
app.use(express.static('dist/client'));

// In-memory storage (lost on restart - that's OK!)
interface Game extends Omit<GameType, 'submissions'> {
  submissions: Map<string, string[]>; // Use Map internally, serialize for socket events
}

const games = new Map<string, Game>();
const players = new Map<string, Player>();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create game
  socket.on('create_game', ({ playerName, variant, durationMinutes }) => {
    // Validate duration
    if (durationMinutes < MIN_GAME_DURATION_MINUTES || durationMinutes > MAX_GAME_DURATION_MINUTES) {
      socket.emit('error', { message: `Duration must be between ${MIN_GAME_DURATION_MINUTES} and ${MAX_GAME_DURATION_MINUTES} minutes` });
      return;
    }

    const gameId = nanoid(6).toUpperCase(); // Use 6-char uppercase ID
    const playerId = socket.id;

    const game: Game = {
      id: gameId,
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

    // Send game data to creator (serialize Map to Object)
    const gameData = {
      ...game,
      submissions: Object.fromEntries(game.submissions)
    };
    socket.emit('game_created', { gameId, playerId, game: gameData });

    // Also notify that the host joined (so they appear in player list)
    io.to(gameId).emit('player_joined', { player });
  });

  // Join game
  socket.on('join_game', ({ gameId, playerName }) => {
    const game = games.get(gameId);

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

    // Send game state to joining player (serialize Map to Object)
    const gameData = {
      ...game,
      submissions: Object.fromEntries(game.submissions)
    };
    socket.emit('game_joined', { gameId: game.id, playerId, game: gameData });
  });

  // Start game
  socket.on('start_game', ({ gameId }) => {
    const game = games.get(gameId);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.hostId !== socket.id) {
      socket.emit('error', { message: 'Not authorized - only host can start' });
      return;
    }

    if (game.players.length < MIN_PLAYERS) {
      socket.emit('error', { message: `Need at least ${MIN_PLAYERS} players to start` });
      return;
    }

    game.status = 'active';
    game.startedAt = Date.now();
    game.endsAt = Date.now() + game.durationMinutes * 60 * 1000;

    const roomSize = io.sockets.adapter.rooms.get(gameId)?.size || 0;
    const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(gameId) || []);
    console.log(`Starting game with id`, gameId);
    console.log(`  Room size:`, roomSize);
    console.log(`  Sockets in room: ${socketsInRoom.join(', ')}`);
    console.log(`  Game players: ${game.players.join(', ')}`);u

    io.to(gameId).emit('game_started', {
      startedAt: game.startedAt,
      endsAt: game.endsAt
    });

    // Auto-end game after duration
    setTimeout(() => {
      if (game.status === 'active') {
        game.status = 'finished';
        const scores = calculateScores(game);
        console.log(`Game ${gameId} ended, sending game_ended event to room with scores:`, scores);
        io.to(gameId).emit('game_ended', { scores });
      }
    }, game.durationMinutes * 60 * 1000);
  });

  // Submit tag
  socket.on('submit_tag', ({ gameId, tag }) => {
    const game = games.get(gameId);
    const player = players.get(socket.id);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    if (game.status !== 'active') {
      socket.emit('error', { message: 'Game is not active' });
      return;
    }

    // Normalize tag to lowercase
    const normalizedTag = tag.trim().toLowerCase();

    // Validate tag
    if (!isValidHTMLTag(normalizedTag)) {
      socket.emit('tag_invalid', { tag });
      return;
    }

    // Check if already submitted
    const playerTags = game.submissions.get(socket.id) || [];
    if (playerTags.includes(normalizedTag)) {
      socket.emit('tag_duplicate', { tag: normalizedTag });
      return;
    }

    // Add submission
    playerTags.push(normalizedTag);
    game.submissions.set(socket.id, playerTags);

    // Notify based on variant
    if (game.variant === 'quickdraw') {
      // Show to everyone
      io.to(gameId).emit('tag_submitted', {
        playerId: socket.id,
        playerName: player.name,
        tag: normalizedTag
      });
    } else {
      // Sharpshooter: only confirm to submitter
      socket.emit('tag_submitted', {
        playerId: socket.id,
        tag: normalizedTag
      });
    }
  });

  // Get game state (for players who join mid-game or refresh)
  socket.on('get_game_state', ({ gameId, playerId }) => {
    console.log(`get_game_state: gameId=${gameId}, playerId=${playerId}, socket.id=${socket.id}`);
    const game = games.get(gameId);

    if (!game) {
      console.log(`Game ${gameId} not found`);
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    console.log(`Game ${gameId} players: ${game.players.join(', ')}, status: ${game.status}`);

    // Verify player is part of this game
    if (!game.players.includes(playerId)) {
      console.log(`Player ${playerId} not in game players list`);
      socket.emit('error', { message: 'You are not part of this game' });
      return;
    }

    // Update player's socket ID and ensure they're in the room
    const player = players.get(playerId);
    console.log(`Found player: ${player ? player.name : 'null'}`);

    if (player) {
      // Update the player entry with new socket ID (only if different)
      if (playerId !== socket.id) {
        players.delete(playerId);
        players.set(socket.id, player);

        // Update game's player list
        const playerIndex = game.players.indexOf(playerId);
        if (playerIndex !== -1) {
          game.players[playerIndex] = socket.id;
        }

        // Update submissions map if player had submissions
        const oldSubmissions = game.submissions.get(playerId);
        if (oldSubmissions) {
          game.submissions.delete(playerId);
          game.submissions.set(socket.id, oldSubmissions);
        }
      }

      // Join the game room
      socket.join(gameId);
      console.log(`Player ${socket.id} (${player.name}) joined room ${gameId}`);
    }

    const gameData = {
      ...game,
      submissions: Object.fromEntries(game.submissions)
    };

    console.log(`Sending game_state: status=${gameData.status}, endsAt=${gameData.endsAt}`);
    socket.emit('game_state', { game: gameData });
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Could handle cleanup here, but not critical for ephemeral games
  });
});

function calculateScores(game: Game): PlayerScore[] {
  // Build player names map
  const playerNames = new Map<string, string>();
  game.players.forEach(playerId => {
    const player = players.get(playerId);
    if (player) {
      playerNames.set(playerId, player.name);
    }
  });

  const scoringInput = {
    playerIds: game.players,
    playerNames,
    submissions: game.submissions
  };

  if (game.variant === 'sharpshooter') {
    return calculateSharpshooterScores(scoringInput);
  } else {
    return calculateQuickdrawScores(scoringInput);
  }
}

httpServer.listen(3000, () => {
  console.log('Server running on port 3000');
});
