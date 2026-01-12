import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create a more realistic socket mock that simulates async behavior
class MockSocket {
  id: string;
  connected: boolean = false;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(public url: string) {
    this.id = `mock-socket-${Math.random().toString(36).substring(2, 11)}`;
    // Simulate async connection
    setTimeout(() => {
      this.connected = true;
      this.trigger('connect');
    }, 0);
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(callback);
    }
    return this;
  }

  emit(_event: string, ..._args: any[]) {
    // Simulate async emission
    return this;
  }

  disconnect() {
    this.connected = false;
    this.trigger('disconnect');
    return this;
  }

  // Simulate receiving an event from server
  trigger(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }
}

// Must be defined before vi.mock due to hoisting
let mockSocketInstance: MockSocket | null = null;
let mockIoCallCount = 0;

// Mock socket.io-client - must use factory function
vi.mock('socket.io-client', () => ({
  io: vi.fn((url: string) => {
    mockIoCallCount++;
    mockSocketInstance = new MockSocket(url);
    return mockSocketInstance;
  }),
}));

// Import after mocks are set up
const { useGameWebSocket } = await import('../use-game-websocket');

// Helper to wait for next tick and any pending promises
const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 10));

describe('useGameWebSocket - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocketInstance = null;
    mockIoCallCount = 0;
  });

  afterEach(async () => {
    const { disconnect } = useGameWebSocket();
    disconnect();
    await waitForNextTick();
  });

  describe('Socket ID Persistence - Critical Bug Fix', () => {
    it('should maintain the same socket ID across navigation', async () => {
      // Step 1: GameSetupView connects
      const ws1 = useGameWebSocket();
      ws1.connect();
      await waitForNextTick();

      const firstSocketId = mockSocketInstance?.id;
      expect(firstSocketId).toBeDefined();
      const firstCallCount = mockIoCallCount;

      // Step 2: Navigate to GameView (different component, same composable)
      const ws2 = useGameWebSocket();
      ws2.connect();
      await waitForNextTick();

      const secondSocketId = mockSocketInstance?.id;

      // Socket ID must be the same!
      expect(secondSocketId).toBe(firstSocketId);
      // And io should only have been called once
      expect(mockIoCallCount).toBe(firstCallCount);
    });

    it('should preserve socket connection during component lifecycle', async () => {
      const ws = useGameWebSocket();
      ws.connect();
      await waitForNextTick();

      expect(ws.connected.value).toBe(true);
      const socketId = mockSocketInstance?.id;

      // Simulate component unmount (but composable doesn't disconnect anymore)
      // In real app, the component would unmount but socket stays alive
      await waitForNextTick();

      // Socket should still be connected
      expect(mockSocketInstance?.connected).toBe(true);
      expect(mockSocketInstance?.id).toBe(socketId);
    });

    it('should allow explicit disconnect and reconnect', async () => {
      const ws = useGameWebSocket();
      ws.connect();
      await waitForNextTick();

      const firstSocketId = mockSocketInstance?.id;

      // Explicitly disconnect
      ws.disconnect();
      await waitForNextTick();

      expect(ws.connected.value).toBe(false);

      // Reconnect
      ws.connect();
      await waitForNextTick();

      const secondSocketId = mockSocketInstance?.id;

      // After explicit disconnect, we get a NEW socket ID
      expect(secondSocketId).not.toBe(firstSocketId);
      expect(ws.connected.value).toBe(true);
    });
  });

  describe('Event Flow - Simulating Real Game Scenario', () => {
    it('should handle complete game creation flow', async () => {
      const ws = useGameWebSocket();
      ws.connect();
      await waitForNextTick();

      // Setup listener for game_created
      const gameCreatedHandler = vi.fn();
      ws.onEvent('game_created', gameCreatedHandler);

      // Create game
      ws.createGame('TestPlayer', 'brainiac', 2);

      // Simulate server response
      mockSocketInstance?.trigger('game_created', {
        gameId: 'GAME123',
        playerId: 'player-123',
        game: {
          id: 'GAME123',
          variant: 'brainiac',
          durationMinutes: 2,
        },
      });

      await waitForNextTick();

      expect(gameCreatedHandler).toHaveBeenCalledWith({
        gameId: 'GAME123',
        playerId: 'player-123',
        game: expect.objectContaining({
          id: 'GAME123',
          variant: 'brainiac',
        }),
      });
    });

    it('should handle navigation from lobby to game with events', async () => {
      const ws1 = useGameWebSocket();
      ws1.connect();
      await waitForNextTick();

      // In LobbyView - listen for game_started
      const gameStartedHandler = vi.fn();
      ws1.onEvent('game_started', gameStartedHandler);

      // Simulate server sending game_started
      mockSocketInstance?.trigger('game_started', {
        startedAt: Date.now(),
        endsAt: Date.now() + 120000,
      });

      await waitForNextTick();

      expect(gameStartedHandler).toHaveBeenCalled();

      // Navigate to GameView (same socket!)
      const ws2 = useGameWebSocket();

      // GameView should receive game_state with same socket
      const gameStateHandler = vi.fn();
      ws2.onEvent('game_state', gameStateHandler);

      mockSocketInstance?.trigger('game_state', {
        game: {
          id: 'GAME123',
          status: 'active',
          endsAt: Date.now() + 120000,
        },
      });

      await waitForNextTick();

      expect(gameStateHandler).toHaveBeenCalled();
    });

    it('should handle tag submission with feedback', async () => {
      const ws = useGameWebSocket();
      ws.connect();
      await waitForNextTick();

      const tagSubmittedHandler = vi.fn();
      const tagInvalidHandler = vi.fn();

      ws.onEvent('tag_submitted', tagSubmittedHandler);
      ws.onEvent('tag_invalid', tagInvalidHandler);

      // Submit valid tag
      ws.submitTag('GAME123', 'div');

      // Simulate server confirming
      mockSocketInstance?.trigger('tag_submitted', {
        playerId: 'player-123',
        tag: 'div',
      });

      await waitForNextTick();

      expect(tagSubmittedHandler).toHaveBeenCalledWith({
        playerId: 'player-123',
        tag: 'div',
      });

      // Submit invalid tag
      ws.submitTag('GAME123', 'invalid');

      mockSocketInstance?.trigger('tag_invalid', {
        tag: 'invalid',
      });

      await waitForNextTick();

      expect(tagInvalidHandler).toHaveBeenCalledWith({
        tag: 'invalid',
      });
    });
  });

  describe('Connection State Management', () => {
    it('should track connection state changes asynchronously', async () => {
      const ws = useGameWebSocket();

      expect(ws.connected.value).toBe(false);

      ws.connect();

      // Wait for async connection
      await waitForNextTick();

      expect(ws.connected.value).toBe(true);
    });

    it('should handle disconnection events', async () => {
      const ws = useGameWebSocket();
      ws.connect();
      await waitForNextTick();

      expect(ws.connected.value).toBe(true);

      // Simulate unexpected disconnect from server
      mockSocketInstance?.disconnect();
      await waitForNextTick();

      expect(ws.connected.value).toBe(false);
    });
  });

  describe('Singleton Behavior', () => {
    it('should share the same socket instance across multiple composable calls', async () => {
      const ws1 = useGameWebSocket();
      const ws2 = useGameWebSocket();
      const ws3 = useGameWebSocket();

      ws1.connect();
      await waitForNextTick();

      ws2.connect();
      ws3.connect();
      await waitForNextTick();

      // Only one socket should be created
      expect(mockIoCallCount).toBe(1);

      // All should share the same connected state
      expect(ws1.connected.value).toBe(true);
      expect(ws2.connected.value).toBe(true);
      expect(ws3.connected.value).toBe(true);
    });
  });

  describe('Regression Test - Original Navigation Bug', () => {
    /**
     * Documents the exact bug we encountered:
     *
     * Before Fix:
     * 1. Host creates game in GameSetupView with socket ID "ABC"
     * 2. playerId "ABC" stored in localStorage
     * 3. Game starts, navigate to GameView
     * 4. GameSetupView unmounts → socket disconnects
     * 5. GameView mounts → new socket connects with ID "XYZ"
     * 6. GameView calls getGameState with playerId "ABC"
     * 7. Server can't find player "ABC" (current socket is "XYZ")
     * 8. Timer doesn't start, no events received
     *
     * After Fix:
     * - Socket persists across navigation
     * - Socket ID stays "ABC"
     * - getGameState works correctly
     * - Timer starts, events received
     */
    it('should NOT cause socket ID mismatch when navigating', async () => {
      // Simulate the exact bug scenario
      const gameSetupView = useGameWebSocket();
      gameSetupView.connect();
      await waitForNextTick();

      const originalSocketId = mockSocketInstance?.id;

      // Store in "localStorage" (simulate what happens in real app)
      const storedPlayerId = originalSocketId;

      // Navigate to GameView
      const gameView = useGameWebSocket();
      gameView.connect();
      await waitForNextTick();

      const currentSocketId = mockSocketInstance?.id;

      // THIS IS THE FIX: Socket ID must be the same!
      expect(currentSocketId).toBe(originalSocketId);
      expect(currentSocketId).toBe(storedPlayerId);

      // Now getGameState should work
      gameView.getGameState('GAME123', storedPlayerId!);

      // Simulate server response (server finds the player)
      const gameStateHandler = vi.fn();
      gameView.onEvent('game_state', gameStateHandler);

      mockSocketInstance?.trigger('game_state', {
        game: {
          id: 'GAME123',
          status: 'active',
          endsAt: Date.now() + 120000,
        },
      });

      await waitForNextTick();

      // Event should be received!
      expect(gameStateHandler).toHaveBeenCalled();
    });
  });
});
