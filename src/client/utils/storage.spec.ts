import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPlayerName, setPlayerName, clearPlayerName } from './storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Replace global localStorage with mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('setPlayerName', () => {
    it('should store player name in localStorage', () => {
      setPlayerName('Alice');
      expect(localStorage.getItem('tgsr_player_name')).toBe('Alice');
    });

    it('should overwrite existing player name', () => {
      setPlayerName('Alice');
      setPlayerName('Bob');
      expect(localStorage.getItem('tgsr_player_name')).toBe('Bob');
    });

    it('should handle empty string', () => {
      setPlayerName('');
      expect(localStorage.getItem('tgsr_player_name')).toBe('');
    });

    it('should handle special characters', () => {
      const specialName = 'Player_123!@#';
      setPlayerName(specialName);
      expect(localStorage.getItem('tgsr_player_name')).toBe(specialName);
    });
  });

  describe('getPlayerName', () => {
    it('should retrieve stored player name', () => {
      localStorage.setItem('tgsr_player_name', 'Alice');
      expect(getPlayerName()).toBe('Alice');
    });

    it('should return null when no name is stored', () => {
      expect(getPlayerName()).toBeNull();
    });

    it('should return null after clearing localStorage', () => {
      setPlayerName('Alice');
      localStorage.clear();
      expect(getPlayerName()).toBeNull();
    });
  });

  describe('clearPlayerName', () => {
    it('should remove player name from localStorage', () => {
      setPlayerName('Alice');
      clearPlayerName();
      expect(localStorage.getItem('tgsr_player_name')).toBeNull();
    });

    it('should not throw error when clearing non-existent name', () => {
      expect(() => clearPlayerName()).not.toThrow();
    });

    it('should only remove player name, not other localStorage items', () => {
      localStorage.setItem('other_key', 'other_value');
      setPlayerName('Alice');

      clearPlayerName();

      expect(localStorage.getItem('tgsr_player_name')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });
  });

  describe('integration', () => {
    it('should handle full lifecycle: set, get, clear, get', () => {
      // Set
      setPlayerName('Alice');
      expect(getPlayerName()).toBe('Alice');

      // Update
      setPlayerName('Bob');
      expect(getPlayerName()).toBe('Bob');

      // Clear
      clearPlayerName();
      expect(getPlayerName()).toBeNull();
    });
  });
});
