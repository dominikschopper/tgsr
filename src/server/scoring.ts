import type { PlayerScore } from '../shared/types.js';

export interface ScoringInput {
  playerIds: string[];
  playerNames: Map<string, string>;
  submissions: Map<string, string[]>;
}

export function calculateSharpshooterScores(input: ScoringInput): PlayerScore[] {
  const { playerIds, playerNames, submissions } = input;
  const playerCount = playerIds.length;

  // Count how many times each tag appears across all players
  const tagCounts = new Map<string, number>();
  submissions.forEach((tags) => {
    tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Calculate score for each player
  const scores: PlayerScore[] = [];
  playerIds.forEach(playerId => {
    const playerTags = submissions.get(playerId) || [];

    let score = 0;
    playerTags.forEach(tag => {
      const count = tagCounts.get(tag) || 0;
      // Start with playerCount points, subtract (count - 1) for duplicates
      // Example: 4 players, tag appears 2 times → 4 - (2 - 1) = 3 points
      score += playerCount - (count - 1);
    });

    scores.push({
      playerId,
      playerName: playerNames.get(playerId) || 'Unknown',
      score,
      tags: playerTags
    });
  });

  return scores.sort((a, b) => b.score - a.score);
}

export function calculateQuickdrawScores(input: ScoringInput): PlayerScore[] {
  const { playerIds, playerNames, submissions } = input;

  // Track who submitted each tag first
  const tagOwnership = new Map<string, string>();

  // Build ownership map based on who submitted first
  // Iterate through players in order to maintain submission order
  playerIds.forEach(playerId => {
    const playerTags = submissions.get(playerId) || [];
    playerTags.forEach(tag => {
      if (!tagOwnership.has(tag)) {
        tagOwnership.set(tag, playerId);
      }
    });
  });

  const scores: PlayerScore[] = [];
  playerIds.forEach(playerId => {
    const playerTags = submissions.get(playerId) || [];

    // Count how many tags this player owns (submitted first)
    const uniqueTags = playerTags.filter(tag => tagOwnership.get(tag) === playerId).length;

    scores.push({
      playerId,
      playerName: playerNames.get(playerId) || 'Unknown',
      score: uniqueTags,
      tags: playerTags,
      uniqueTags
    });
  });

  return scores.sort((a, b) => b.score - a.score);
}
