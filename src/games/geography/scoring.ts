import type { Point } from './types';

export type ScoreBand = 'perfect' | 'close' | 'near' | 'miss';

export interface ScoreResult {
  points: number;
  distance: number;
  band: ScoreBand;
}

export function calculateDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function scoreGuess(guess: Point, answer: Point): ScoreResult {
  const distance = calculateDistance(guess, answer);
  if (distance <= 0.03) {
    return { points: 100, distance, band: 'perfect' };
  }
  if (distance <= 0.1) {
    return { points: 50, distance, band: 'close' };
  }
  if (distance <= 0.2) {
    return { points: 25, distance, band: 'near' };
  }
  return { points: 0, distance, band: 'miss' };
}

export function getRating(totalScore: number): 'Explorer' | 'Navigator' | 'Master' {
  if (totalScore <= 300) return 'Explorer';
  if (totalScore <= 700) return 'Navigator';
  return 'Master';
}
