import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { Game } from '../../../shared/types';

// Mock router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock WebSocket composable - create mocks inside factory
vi.mock('../../composables/use-game-websocket', () => {
  const mockStartGame = vi.fn();
  const mockGetGameState = vi.fn();
  const mockOnEvent = vi.fn();
  const mockOffEvent = vi.fn();

  return {
    useGameWebSocket: () => ({
      startGame: mockStartGame,
      getGameState: mockGetGameState,
      onEvent: mockOnEvent,
      offEvent: mockOffEvent,
    }),
  };
});

// Mock storage with controllable player ID
let mockPlayerId = 'player-123';
vi.mock('../../utils/storage', () => ({
  getPlayerId: () => mockPlayerId,
}));

// Import component and composable after mocks
const LobbyView = await import('./index.vue').then(m => m.default);
const { useGameWebSocket } = await import('../../composables/use-game-websocket');

describe('LobbyView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlayerId = 'player-123'; // Reset to default
  });

  describe('Start button visibility - Critical Bug Prevention', () => {
    it('should show Start button when player is the host', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      // Simulate game state where current player is host
      const hostGame: Game = {
        id: 'GAME01',
        hostId: 'player-123', // Same as mockPlayerId
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      // Set game state directly through component's logic
      wrapper.vm.game = hostGame;
      wrapper.vm.players = [
        { id: 'player-123', name: 'Alice', socketId: 's1' },
        { id: 'player-456', name: 'Bob', socketId: 's2' },
      ];

      await nextTick();

      // Start button should be visible
      const startButton = wrapper.find('button:not(.secondary)');
      expect(startButton.exists()).toBe(true);
      expect(startButton.text()).toBe('Start Game');

      // "Waiting for host" message should NOT be visible
      const waitingMessage = wrapper.find('p.text-center');
      expect(waitingMessage.text()).not.toContain('Waiting for host');
    });

    it('should NOT show Start button when player is not the host', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      // Simulate game state where current player is NOT host
      const nonHostGame: Game = {
        id: 'GAME01',
        hostId: 'other-player-456', // Different from mockPlayerId
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = nonHostGame;
      wrapper.vm.players = [
        { id: 'other-player-456', name: 'Alice', socketId: 's1' },
        { id: 'player-123', name: 'Bob', socketId: 's2' },
      ];

      await nextTick();

      // Start button should NOT exist (only "Leave Game" button should exist)
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBe(1); // Only "Leave Game" button
      expect(buttons[0].text()).toBe('Leave Game');

      // "Waiting for host" message SHOULD be visible
      const waitingMessage = wrapper.text();
      expect(waitingMessage).toContain('Waiting for host to start the game');
    });

    it('should enable Start button for solo play (1 player)', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      const hostGame: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = hostGame;
      wrapper.vm.players = [
        { id: 'player-123', name: 'Alice', socketId: 's1' },
      ]; // Only 1 player (solo mode)

      await nextTick();

      const startButton = wrapper.find('button:not(.secondary)');
      expect(startButton.exists()).toBe(true);
      expect(startButton.attributes('disabled')).toBeUndefined(); // Solo play allowed!
    });

    it('should enable Start button when 2 or more players', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      const hostGame: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = hostGame;
      wrapper.vm.players = [
        { id: 'player-123', name: 'Alice', socketId: 's1' },
        { id: 'player-456', name: 'Bob', socketId: 's2' },
      ];

      await nextTick();

      const startButton = wrapper.find('button:not(.secondary)');
      expect(startButton.exists()).toBe(true);
      expect(startButton.attributes('disabled')).toBeUndefined();
    });

    it('should call startGame when Start button is clicked', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      const hostGame: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = hostGame;
      wrapper.vm.players = [
        { id: 'player-123', name: 'Alice', socketId: 's1' },
        { id: 'player-456', name: 'Bob', socketId: 's2' },
      ];

      await nextTick();

      // Get the mock from the composable
      const { startGame } = useGameWebSocket();

      const startButton = wrapper.find('button:not(.secondary)');
      await startButton.trigger('click');

      expect(startGame).toHaveBeenCalledWith('GAME01');
    });
  });

  describe('Host badge visibility', () => {
    it('should show host badge next to host player', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      const game: Game = {
        id: 'GAME01',
        hostId: 'player-456',
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = game;
      wrapper.vm.players = [
        { id: 'player-123', name: 'Alice', socketId: 's1' },
        { id: 'player-456', name: 'Bob', socketId: 's2' }, // Host
      ];

      await nextTick();

      const hostBadges = wrapper.findAll('.host-badge');
      expect(hostBadges.length).toBe(1);

      // Find the player list item that contains the host badge
      const playerItems = wrapper.findAll('.player-list-item');
      const bobItem = playerItems.find(item => item.text().includes('Bob'));
      expect(bobItem?.text()).toContain('Host');

      // Alice should not have host badge
      const aliceItem = playerItems.find(item => item.text().includes('Alice'));
      expect(aliceItem?.text()).not.toContain('Host');
    });
  });

  describe('Game information display', () => {
    it('should display game ID', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      const game: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = game;
      await nextTick();

      expect(wrapper.text()).toContain('GAME01');
    });

    it('should display game variant correctly', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      const sharpshooterGame: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'sharpshooter',
        durationMinutes: 2,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = sharpshooterGame;
      await nextTick();

      expect(wrapper.text()).toContain('Sharpshooter');

      // Test quickdraw variant
      const quickdrawGame: Game = {
        ...sharpshooterGame,
        variant: 'quickdraw',
      };

      wrapper.vm.game = quickdrawGame;
      await nextTick();

      expect(wrapper.text()).toContain('Quickdraw');
    });

    it('should display duration with correct singular/plural', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      // Test singular (1 minute)
      const oneMinuteGame: Game = {
        id: 'GAME01',
        hostId: 'player-123',
        variant: 'sharpshooter',
        durationMinutes: 1,
        status: 'waiting',
        playerTags: new Map(),
      };

      wrapper.vm.game = oneMinuteGame;
      await nextTick();

      expect(wrapper.text()).toContain('1 minute');

      // Test plural (2 minutes)
      const twoMinutesGame: Game = {
        ...oneMinuteGame,
        durationMinutes: 2,
      };

      wrapper.vm.game = twoMinutesGame;
      await nextTick();

      expect(wrapper.text()).toContain('2 minutes');
    });
  });

  describe('Player count display', () => {
    it('should display correct player count', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      wrapper.vm.players = [
        { id: 'p1', name: 'Alice', socketId: 's1' },
        { id: 'p2', name: 'Bob', socketId: 's2' },
        { id: 'p3', name: 'Charlie', socketId: 's3' },
      ];

      await nextTick();

      expect(wrapper.text()).toContain('Players (3)');
    });
  });

  describe('Error message display', () => {
    it('should display error message when present', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      wrapper.vm.errorMessage = 'Not enough players to start';
      await nextTick();

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toBe('Not enough players to start');
    });

    it('should not display error message when empty', async () => {
      const wrapper = mount(LobbyView, {
        props: {
          gameId: 'GAME01',
        },
      });

      wrapper.vm.errorMessage = '';
      await nextTick();

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(false);
    });
  });
});
