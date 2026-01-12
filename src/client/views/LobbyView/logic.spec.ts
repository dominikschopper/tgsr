import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLobbyViewLogic } from './logic';
import type { Router } from 'vue-router';
import type { Game, Player } from '../../../shared/types';

// Mock storage
vi.mock('../../utils/storage', () => ({
  getPlayerId: vi.fn(() => 'player-123'),
}));

describe('useLobbyViewLogic', () => {
  let mockRouter: Router;
  let mockStartGame: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
    } as unknown as Router;

    mockStartGame = vi.fn();
  });

  describe('isHost detection', () => {
    it('should return true when player is the host', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      // Simulate game created event where player is host
      const mockGame: Game = {
        id: 'GAME01',
        hostId: 'player-123', // Same as mocked getPlayerId()
        variant: 'brainiac',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      logic.handleGameCreated({
        gameId: 'GAME01',
        playerId: 'player-123',
        game: mockGame,
      });

      expect(logic.isHost()).toBe(true);
    });

    it('should return false when player is not the host', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      // Simulate game joined event where player is NOT host
      const mockGame: Game = {
        id: 'GAME01',
        hostId: 'other-player-456', // Different from mocked getPlayerId()
        variant: 'brainiac',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      logic.handleGameJoined({
        gameId: 'GAME01',
        playerId: 'player-123',
        game: mockGame,
      });

      expect(logic.isHost()).toBe(false);
    });

    it('should return false when no game is loaded', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      // No game created/joined yet
      expect(logic.isHost()).toBe(false);
    });

    it('should update host status when game state changes', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      // Initially not host
      const mockGameNotHost: Game = {
        id: 'GAME01',
        hostId: 'other-player',
        variant: 'brainiac',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      logic.handleGameState({ game: mockGameNotHost });
      expect(logic.isHost()).toBe(false);

      // Game state changes (edge case: host transferred)
      const mockGameIsHost: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'brainiac',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      logic.handleGameState({ game: mockGameIsHost });
      expect(logic.isHost()).toBe(true);
    });
  });

  describe('player management', () => {
    it('should add new players when they join', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      const player1: Player = {
        id: 'player-1',
        name: 'Alice',
        socketId: 'socket-1',
      };

      logic.handlePlayerJoined({ player: player1 });

      expect(logic.players.value).toHaveLength(1);
      expect(logic.players.value[0]).toEqual(player1);
    });

    it('should not add duplicate players', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      const player: Player = {
        id: 'player-1',
        name: 'Alice',
        socketId: 'socket-1',
      };

      logic.handlePlayerJoined({ player });
      logic.handlePlayerJoined({ player }); // Join twice

      expect(logic.players.value).toHaveLength(1);
    });

    it('should handle multiple different players joining', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      const player1: Player = { id: 'p1', name: 'Alice', socketId: 's1' };
      const player2: Player = { id: 'p2', name: 'Bob', socketId: 's2' };
      const player3: Player = { id: 'p3', name: 'Charlie', socketId: 's3' };

      logic.handlePlayerJoined({ player: player1 });
      logic.handlePlayerJoined({ player: player2 });
      logic.handlePlayerJoined({ player: player3 });

      expect(logic.players.value).toHaveLength(3);
    });
  });

  describe('game navigation', () => {
    it('should navigate to play view when game starts', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      logic.handleGameStarted({
        startedAt: Date.now(),
        endsAt: Date.now() + 120000,
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/play/GAME01');
    });

    it('should call startGame with correct gameId when handleStartGame is called', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      logic.handleStartGame();

      expect(mockStartGame).toHaveBeenCalledWith('GAME01');
    });

    it('should clear error message when starting game', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      // Set an error first
      logic.handleError({ message: 'Some error' });
      expect(logic.errorMessage.value).toBe('Some error');

      // Start game should clear error
      logic.handleStartGame();
      expect(logic.errorMessage.value).toBe('');
    });
  });

  describe('error handling', () => {
    it('should set error message when error occurs', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      logic.handleError({ message: 'Not enough players' });

      expect(logic.errorMessage.value).toBe('Not enough players');
    });
  });

  describe('game state handling', () => {
    it('should only update game when gameId matches (handleGameCreated)', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      const mockGame: Game = {
        id: 'GAME02', // Different game ID
        hostId: 'player-123',
        variant: 'brainiac',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      logic.handleGameCreated({
        gameId: 'GAME02', // Wrong game
        playerId: 'player-123',
        game: mockGame,
      });

      expect(logic.game.value).toBeNull(); // Should not update
    });

    it('should update game when gameId matches (handleGameCreated)', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      const mockGame: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'quickdraw',
        durationMinutes: 3,
        status: 'waiting',
        playerTags: new Map(),
      };

      logic.handleGameCreated({
        gameId: 'GAME01',
        playerId: 'player-123',
        game: mockGame,
      });

      expect(logic.game.value).toEqual(mockGame);
    });

    it('should only update game when gameId matches (handleGameJoined)', () => {
      const logic = useLobbyViewLogic({
        router: mockRouter,
        gameId: 'GAME01',
        startGame: mockStartGame,
      });

      const wrongGame: Game = {
        id: 'GAME02',
        hostId: 'other-player',
        variant: 'brainiac',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      logic.handleGameJoined({
        gameId: 'GAME02', // Wrong game
        playerId: 'player-123',
        game: wrongGame,
      });

      expect(logic.game.value).toBeNull(); // Should not update
    });
  });
});
