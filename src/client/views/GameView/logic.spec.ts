import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameViewLogic } from './logic';

const MOCK_GAME_ID = 'TEST123';

describe('useGameViewLogic - Multi-Tag Input', () => {
  let mockSubmitTag: ReturnType<typeof vi.fn<[gameId: string, tag: string], void>>;
  let logic: ReturnType<typeof useGameViewLogic>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSubmitTag = vi.fn<[gameId: string, tag: string], void>();
    logic = useGameViewLogic({
      gameId: MOCK_GAME_ID,
      submitTag: mockSubmitTag,
    });

    // Set time remaining to allow submissions
    logic.handleGameState({
      game: {
        id: MOCK_GAME_ID,
        status: 'active',
        endsAt: Date.now() + 60000,
        variant: 'brainiac',
        durationMinutes: 1,
        hostId: 'test-host',
        playerTags: new Map(),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    logic.cleanup();
  });

  describe('Tag Splitting', () => {
    it('should split tags on spaces', () => {
      logic.tagInput.value = 'div span button';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
    });

    it('should split tags on commas', () => {
      logic.tagInput.value = 'div,span,button';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
    });

    it('should split on mixed delimiters', () => {
      logic.tagInput.value = 'div, span; button | nav';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(4);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'nav');
    });

    it('should split on newlines', () => {
      logic.tagInput.value = 'div\nspan\nbutton';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
    });

    it('should handle single tag (backward compatibility)', () => {
      logic.tagInput.value = 'div';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(1);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
    });

    it('should handle extra whitespace', () => {
      logic.tagInput.value = '  div   span   button  ';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
    });

    it('should handle empty input', () => {
      logic.tagInput.value = '';
      logic.handleSubmitTag();

      expect(mockSubmitTag).not.toHaveBeenCalled();
    });

    it('should handle only delimiters', () => {
      logic.tagInput.value = '  , ; |  ';
      logic.handleSubmitTag();

      expect(mockSubmitTag).not.toHaveBeenCalled();
    });

    it('should split on various special characters', () => {
      logic.tagInput.value = 'div.span-button/nav';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(4);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'nav');
    });
  });

  describe('Duplicate Handling', () => {
    it('should deduplicate tags within input', () => {
      logic.tagInput.value = 'div span div button span';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
    });

    it('should show duplicate count in feedback', () => {
      logic.tagInput.value = 'div span div';
      logic.handleSubmitTag();

      expect(logic.feedbackMessage.value).toContain('2 submitted');
      expect(logic.feedbackMessage.value).toContain('1 duplicate in input');
    });

    it('should pluralize duplicates correctly', () => {
      logic.tagInput.value = 'div span div span button';
      logic.handleSubmitTag();

      expect(logic.feedbackMessage.value).toContain('3 submitted');
      expect(logic.feedbackMessage.value).toContain('2 duplicates in input');
    });

    it('should handle all duplicates', () => {
      logic.tagInput.value = 'div div div';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(1);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(logic.feedbackMessage.value).toContain('1 submitted');
      expect(logic.feedbackMessage.value).toContain('2 duplicates in input');
    });
  });

  describe('Feedback Messages', () => {
    it('should show count of submitted tags', () => {
      logic.tagInput.value = 'div span button';
      logic.handleSubmitTag();

      expect(logic.feedbackMessage.value).toBe('OK: 3 submitted');
    });

    it('should show combined feedback for duplicates', () => {
      logic.tagInput.value = 'div span div';
      logic.handleSubmitTag();

      expect(logic.feedbackMessage.value).toContain('2 submitted');
      expect(logic.feedbackMessage.value).toContain('1 duplicate in input');
    });

    it('should clear input after submission', () => {
      logic.tagInput.value = 'div span';
      logic.handleSubmitTag();

      expect(logic.tagInput.value).toBe('');
    });

    it('should clear feedback after timeout', () => {
      logic.tagInput.value = 'div span';
      logic.handleSubmitTag();

      expect(logic.feedbackMessage.value).toBeTruthy();

      vi.advanceTimersByTime(2000);

      expect(logic.feedbackMessage.value).toBe('');
    });
  });

  describe('Quickdraw Mode - Taken Tags', () => {
    beforeEach(() => {
      // Set variant to quickdraw
      logic.handleGameState({
        game: {
          id: MOCK_GAME_ID,
          status: 'active',
          endsAt: Date.now() + 60000,
          variant: 'quickdraw',
          durationMinutes: 1,
          hostId: 'test-host',
          playerTags: new Map(),
        },
      });

      // Simulate some tags already taken
      logic.allTags.value.set('player1', ['div', 'span']);
      logic.allTags.value.set('player2', ['button']);
    });

    it('should filter out already-taken tags', () => {
      logic.tagInput.value = 'div nav section';
      logic.handleSubmitTag();

      // Only nav and section should be submitted (div is taken)
      expect(mockSubmitTag).toHaveBeenCalledTimes(2);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'nav');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'section');
    });

    it('should show taken count in feedback', () => {
      logic.tagInput.value = 'div span nav';
      logic.handleSubmitTag();

      expect(logic.feedbackMessage.value).toContain('1 submitted');
      expect(logic.feedbackMessage.value).toContain('2 already taken');
    });

    it('should handle all tags taken', () => {
      logic.tagInput.value = 'div span button';
      logic.handleSubmitTag();

      expect(mockSubmitTag).not.toHaveBeenCalled();
      expect(logic.feedbackMessage.value).toContain('3 already taken');
    });

    it('should handle combination of taken and duplicates', () => {
      logic.tagInput.value = 'div nav div span';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(1);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'nav');
      expect(logic.feedbackMessage.value).toContain('1 submitted');
      // takenCount is calculated as: total tags (4) - tags to submit after filtering (1) = 3
      // This includes both duplicates and already-taken tags
      expect(logic.feedbackMessage.value).toContain('3 already taken');
    });

    it('should not affect brainiac mode', () => {
      // Switch back to brainiac
      logic.handleGameState({
        game: {
          id: MOCK_GAME_ID,
          status: 'active',
          endsAt: Date.now() + 60000,
          variant: 'brainiac',
          durationMinutes: 1,
          hostId: 'test-host',
          playerTags: new Map(),
        },
      });

      // Same tags should be submittable in brainiac mode
      logic.tagInput.value = 'div span button';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
      expect(logic.feedbackMessage.value).toBe('OK: 3 submitted');
    });
  });

  describe('Time Validation', () => {
    it('should not submit when time is up', () => {
      logic.handleGameState({
        game: {
          id: MOCK_GAME_ID,
          status: 'active',
          endsAt: Date.now() - 1000, // Time already passed
          variant: 'brainiac',
          durationMinutes: 1,
          hostId: 'test-host',
          playerTags: new Map(),
        },
      });

      // Force timer update
      vi.advanceTimersByTime(100);

      logic.tagInput.value = 'div span';
      logic.handleSubmitTag();

      expect(mockSubmitTag).not.toHaveBeenCalled();
      expect(logic.feedbackMessage.value).toBe('Time is up!');
    });

    it('should not clear feedback timeout message for time up', () => {
      logic.handleGameState({
        game: {
          id: MOCK_GAME_ID,
          status: 'active',
          endsAt: Date.now() - 1000,
          variant: 'brainiac',
          durationMinutes: 1,
          hostId: 'test-host',
          playerTags: new Map(),
        },
      });

      vi.advanceTimersByTime(100);

      logic.tagInput.value = 'div span';
      logic.handleSubmitTag();

      expect(logic.feedbackMessage.value).toBe('Time is up!');

      // Time up message should not have a timeout
      vi.advanceTimersByTime(3000);
      expect(logic.feedbackMessage.value).toBe('Time is up!');
    });
  });

  describe('Case Normalization', () => {
    it('should normalize tags to lowercase', () => {
      logic.tagInput.value = 'DIV Span BUTTON';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
    });

    it('should deduplicate case-insensitive', () => {
      logic.tagInput.value = 'div DIV Div';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(1);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(logic.feedbackMessage.value).toContain('1 submitted');
      expect(logic.feedbackMessage.value).toContain('2 duplicates in input');
    });

    it('should handle mixed case with multiple tags', () => {
      logic.tagInput.value = 'DIV span Button NAV';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(4);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'nav');
    });
  });

  describe('Edge Cases', () => {
    it('should handle tabs as delimiters', () => {
      logic.tagInput.value = 'div\tspan\tbutton';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple consecutive delimiters', () => {
      logic.tagInput.value = 'div,,,span;;;button';
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(3);
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'div');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'span');
      expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, 'button');
    });

    it('should handle very long tag list', () => {
      const tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi'];
      logic.tagInput.value = tags.join(' ');
      logic.handleSubmitTag();

      expect(mockSubmitTag).toHaveBeenCalledTimes(10);
      tags.forEach(tag => {
        expect(mockSubmitTag).toHaveBeenCalledWith(MOCK_GAME_ID, tag);
      });
    });

    it('should not submit if input becomes empty after trim', () => {
      logic.tagInput.value = '   \n   \t   ';
      logic.handleSubmitTag();

      expect(mockSubmitTag).not.toHaveBeenCalled();
      expect(logic.feedbackMessage.value).toBe('');
    });
  });

  describe('Integration with Server Responses', () => {
    it('should still handle tag_submitted events for individual tags', () => {
      logic.tagInput.value = 'div span';
      logic.handleSubmitTag();

      // Simulate server response
      logic.handleTagSubmitted({ playerId: 'test-player', tag: 'div' });

      expect(logic.myTags.value).toContain('div');
    });

    it('should handle tag_invalid events', () => {
      logic.tagInput.value = 'div span';
      logic.handleSubmitTag();

      // Simulate server response for invalid tag
      logic.handleTagInvalid({ tag: 'invalidtag' });

      expect(logic.feedbackMessage.value).toContain('invalidtag');
      expect(logic.feedbackMessage.value).toContain('not a valid HTML tag');
    });

    it('should handle tag_duplicate events', () => {
      logic.tagInput.value = 'div span';
      logic.handleSubmitTag();

      // Simulate server response for duplicate
      logic.handleTagDuplicate({ tag: 'div' });

      expect(logic.feedbackMessage.value).toContain('div');
      expect(logic.feedbackMessage.value).toContain('already submitted');
    });
  });
});
