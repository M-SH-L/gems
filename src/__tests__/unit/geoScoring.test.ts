import { describe, expect, it } from 'vitest';
import { scoreGuess, getRating } from '@/games/geography/scoring';

const answer = { x: 0.5, y: 0.5 };

describe('geo scoring', () => {
  it('awards 100 points for exact match', () => {
    expect(scoreGuess({ x: 0.5, y: 0.5 }, answer).points).toBe(100);
  });

  it('awards 100 points within 3%', () => {
    expect(scoreGuess({ x: 0.5, y: 0.529 }, answer).points).toBe(100);
  });

  it('awards 50 points within 10%', () => {
    expect(scoreGuess({ x: 0.5, y: 0.6 }, answer).points).toBe(50);
  });

  it('awards 25 points within 20%', () => {
    expect(scoreGuess({ x: 0.5, y: 0.7 }, answer).points).toBe(25);
  });

  it('awards 0 points beyond 20%', () => {
    expect(scoreGuess({ x: 0.5, y: 0.701 }, answer).points).toBe(0);
  });

  it('sums total score correctly', () => {
    const scores = [
      scoreGuess({ x: 0.5, y: 0.5 }, answer).points,
      scoreGuess({ x: 0.5, y: 0.6 }, answer).points,
      scoreGuess({ x: 0.5, y: 0.8 }, answer).points,
    ];
    expect(scores.reduce((sum, value) => sum + value, 0)).toBe(150);
  });

  it('returns correct rating thresholds', () => {
    expect(getRating(120)).toBe('Explorer');
    expect(getRating(450)).toBe('Navigator');
    expect(getRating(920)).toBe('Master');
  });
});
