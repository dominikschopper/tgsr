import { describe, it, expect } from 'vitest';
import { calculateSharpshooterScores, calculateQuickdrawScores } from './scoring';

describe('calculateSharpshooterScores', () => {
  it('should award playerCount points for each unique tag', () => {
    const input = {
      playerIds: ['player1', 'player2'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', ['div']],
        ['player2', ['span']]
      ])
    };

    const scores = calculateSharpshooterScores(input);

    expect(scores).toHaveLength(2);
    expect(scores[0].score).toBe(2); // 2 players, unique tag = 2 points
    expect(scores[1].score).toBe(2);
  });

  it('should reduce points when tags are duplicated', () => {
    const input = {
      playerIds: ['player1', 'player2', 'player3'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob'],
        ['player3', 'Charlie']
      ]),
      submissions: new Map([
        ['player1', ['div']], // div appears 2 times
        ['player2', ['div']], // div appears 2 times
        ['player3', ['span']] // span is unique
      ])
    };

    const scores = calculateSharpshooterScores(input);

    // player1: div shared by 2 players → 3 - (2-1) = 2 points
    // player2: div shared by 2 players → 3 - (2-1) = 2 points
    // player3: span is unique → 3 - (1-1) = 3 points
    expect(scores.find(s => s.playerId === 'player1')?.score).toBe(2);
    expect(scores.find(s => s.playerId === 'player2')?.score).toBe(2);
    expect(scores.find(s => s.playerId === 'player3')?.score).toBe(3);
  });

  it('should handle multiple tags per player', () => {
    const input = {
      playerIds: ['player1', 'player2'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', ['div', 'span', 'p']],
        ['player2', ['div', 'button']]
      ])
    };

    const scores = calculateSharpshooterScores(input);

    // player1: div (shared=1), span (unique=2), p (unique=2) = 5 points
    // player2: div (shared=1), button (unique=2) = 3 points
    expect(scores.find(s => s.playerId === 'player1')?.score).toBe(5);
    expect(scores.find(s => s.playerId === 'player2')?.score).toBe(3);
  });

  it('should handle all players submitting the same tags', () => {
    const input = {
      playerIds: ['player1', 'player2', 'player3'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob'],
        ['player3', 'Charlie']
      ]),
      submissions: new Map([
        ['player1', ['div', 'span']],
        ['player2', ['div', 'span']],
        ['player3', ['div', 'span']]
      ])
    };

    const scores = calculateSharpshooterScores(input);

    // Each tag appears 3 times with 3 players
    // Per tag: 3 - (3-1) = 1 point
    // 2 tags = 2 points per player
    expect(scores[0].score).toBe(2);
    expect(scores[1].score).toBe(2);
    expect(scores[2].score).toBe(2);
  });

  it('should handle empty submissions', () => {
    const input = {
      playerIds: ['player1', 'player2'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', []],
        ['player2', []]
      ])
    };

    const scores = calculateSharpshooterScores(input);

    expect(scores[0].score).toBe(0);
    expect(scores[1].score).toBe(0);
  });

  it('should handle one player with tags and others empty', () => {
    const input = {
      playerIds: ['player1', 'player2'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', ['div', 'span']],
        ['player2', []]
      ])
    };

    const scores = calculateSharpshooterScores(input);

    // player1 has unique tags = 2 points each
    expect(scores.find(s => s.playerId === 'player1')?.score).toBe(4);
    expect(scores.find(s => s.playerId === 'player2')?.score).toBe(0);
  });

  it('should sort scores in descending order', () => {
    const input = {
      playerIds: ['player1', 'player2', 'player3'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob'],
        ['player3', 'Charlie']
      ]),
      submissions: new Map([
        ['player1', ['div']], // 3 points
        ['player2', ['span', 'p']], // 6 points
        ['player3', []] // 0 points
      ])
    };

    const scores = calculateSharpshooterScores(input);

    expect(scores[0].playerId).toBe('player2'); // Highest score
    expect(scores[0].score).toBe(6);
    expect(scores[1].playerId).toBe('player1');
    expect(scores[1].score).toBe(3);
    expect(scores[2].playerId).toBe('player3');
    expect(scores[2].score).toBe(0);
  });

  it('should include player names and tags in results', () => {
    const input = {
      playerIds: ['player1'],
      playerNames: new Map([['player1', 'Alice']]),
      submissions: new Map([['player1', ['div', 'span']]])
    };

    const scores = calculateSharpshooterScores(input);

    expect(scores[0].playerName).toBe('Alice');
    expect(scores[0].tags).toEqual(['div', 'span']);
  });
});

describe('calculateQuickdrawScores', () => {
  it('should only award points to first player to submit a tag', () => {
    const input = {
      playerIds: ['player1', 'player2'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', ['div']],
        ['player2', ['div']]
      ])
    };

    const scores = calculateQuickdrawScores(input);

    // player1 submitted first, gets the point
    expect(scores.find(s => s.playerId === 'player1')?.score).toBe(1);
    expect(scores.find(s => s.playerId === 'player1')?.uniqueTags).toBe(1);
    // player2 submitted second, gets 0 points
    expect(scores.find(s => s.playerId === 'player2')?.score).toBe(0);
    expect(scores.find(s => s.playerId === 'player2')?.uniqueTags).toBe(0);
  });

  it('should count all unique tags for each player', () => {
    const input = {
      playerIds: ['player1', 'player2'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', ['div', 'span', 'p']],
        ['player2', ['button', 'input']]
      ])
    };

    const scores = calculateQuickdrawScores(input);

    expect(scores.find(s => s.playerId === 'player1')?.score).toBe(3);
    expect(scores.find(s => s.playerId === 'player2')?.score).toBe(2);
  });

  it('should handle mixed unique and duplicate submissions', () => {
    const input = {
      playerIds: ['player1', 'player2', 'player3'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob'],
        ['player3', 'Charlie']
      ]),
      submissions: new Map([
        ['player1', ['div', 'span']],
        ['player2', ['div', 'button']], // div duplicate, button unique
        ['player3', ['span', 'p']] // span duplicate, p unique
      ])
    };

    const scores = calculateQuickdrawScores(input);

    // player1: div (first=1), span (first=1) = 2
    // player2: div (duplicate=0), button (first=1) = 1
    // player3: span (duplicate=0), p (first=1) = 1
    expect(scores.find(s => s.playerId === 'player1')?.score).toBe(2);
    expect(scores.find(s => s.playerId === 'player2')?.score).toBe(1);
    expect(scores.find(s => s.playerId === 'player3')?.score).toBe(1);
  });

  it('should handle empty submissions', () => {
    const input = {
      playerIds: ['player1', 'player2'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', []],
        ['player2', []]
      ])
    };

    const scores = calculateQuickdrawScores(input);

    expect(scores[0].score).toBe(0);
    expect(scores[1].score).toBe(0);
  });

  it('should maintain submission order based on playerIds array', () => {
    // The order in playerIds determines who submitted "first"
    const input = {
      playerIds: ['player2', 'player1'], // player2 is "first" in order
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob']
      ]),
      submissions: new Map([
        ['player1', ['div']],
        ['player2', ['div']]
      ])
    };

    const scores = calculateQuickdrawScores(input);

    // player2 is first in playerIds array, so gets the point
    expect(scores.find(s => s.playerId === 'player2')?.score).toBe(1);
    expect(scores.find(s => s.playerId === 'player1')?.score).toBe(0);
  });

  it('should sort scores in descending order', () => {
    const input = {
      playerIds: ['player1', 'player2', 'player3'],
      playerNames: new Map([
        ['player1', 'Alice'],
        ['player2', 'Bob'],
        ['player3', 'Charlie']
      ]),
      submissions: new Map([
        ['player1', ['div']], // 1 point
        ['player2', ['span', 'p', 'button']], // 3 points
        ['player3', []] // 0 points
      ])
    };

    const scores = calculateQuickdrawScores(input);

    expect(scores[0].playerId).toBe('player2');
    expect(scores[0].score).toBe(3);
    expect(scores[1].playerId).toBe('player1');
    expect(scores[1].score).toBe(1);
    expect(scores[2].playerId).toBe('player3');
    expect(scores[2].score).toBe(0);
  });

  it('should include uniqueTags count in results', () => {
    const input = {
      playerIds: ['player1'],
      playerNames: new Map([['player1', 'Alice']]),
      submissions: new Map([['player1', ['div', 'span']]])
    };

    const scores = calculateQuickdrawScores(input);

    expect(scores[0].uniqueTags).toBe(2);
  });
});
