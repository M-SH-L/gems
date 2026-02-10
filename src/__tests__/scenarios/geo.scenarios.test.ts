import { describe, expect, it } from 'vitest';
import { geoContentByTheme } from '@/games/geography/content';
import { scoreGuess } from '@/games/geography/scoring';

const farGuess = { x: 0, y: 0 };

describe('Geography scenarios', () => {
  it('perfect game scores 100 points per location', () => {
    Object.values(geoContentByTheme).forEach((content) => {
      content.locations.forEach((location) => {
        const result = scoreGuess({ x: location.x, y: location.y }, location);
        expect(result.points).toBe(100);
      });
    });
  });

  it('worst game scores 0 points for distant guesses', () => {
    Object.values(geoContentByTheme).forEach((content) => {
      content.locations.forEach((location) => {
        const result = scoreGuess(farGuess, location);
        expect(result.points).toBe(0);
      });
    });
  });

  it('mixed accuracy alternates between perfect and far guesses', () => {
    Object.values(geoContentByTheme).forEach((content) => {
      const rounds = Math.min(content.rounds, content.locations.length);
      content.locations.slice(0, rounds).forEach((location, index) => {
        const guess = index % 2 === 0 ? { x: location.x, y: location.y } : farGuess;
        const result = scoreGuess(guess, location);
        expect(result.points).toBe(index % 2 === 0 ? 100 : 0);
      });
    });
  });

  it('all locations have valid coordinates and descriptions', () => {
    Object.values(geoContentByTheme).forEach((content) => {
      content.locations.forEach((location) => {
        expect(location.name.length).toBeGreaterThan(0);
        expect(location.description.length).toBeGreaterThan(0);
        expect(location.x).toBeGreaterThanOrEqual(0);
        expect(location.x).toBeLessThanOrEqual(1);
        expect(location.y).toBeGreaterThanOrEqual(0);
        expect(location.y).toBeLessThanOrEqual(1);
      });
    });
  });
});
