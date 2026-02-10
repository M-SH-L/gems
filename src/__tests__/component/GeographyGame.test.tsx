import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GeographyGame from '@/games/geography/GeographyGame';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { getGeoContent } from '@/games/geography/content';

const rect = {
  x: 0,
  y: 0,
  width: 1000,
  height: 500,
  top: 0,
  left: 0,
  right: 1000,
  bottom: 500,
  toJSON: () => ({}),
} as DOMRect;

describe('GeographyGame', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the map and prompt text', () => {
    renderWithProviders(<GeographyGame />);

    expect(screen.getByTestId('map-canvas')).toBeInTheDocument();
    expect(screen.getByText(/find:/i)).toBeInTheDocument();
  });

  it('allows a guess and advances rounds', () => {
    renderWithProviders(<GeographyGame />);

    const prompt = screen.getByText(/find:/i).textContent ?? '';
    const locationName = prompt.replace(/find:/i, '').trim();
    const content = getGeoContent('retro');
    const location = content.locations.find((loc) => loc.name === locationName);

    expect(location).toBeTruthy();

    const map = screen.getByTestId('map-canvas');
    fireEvent.click(map, {
      clientX: rect.left + (location?.x ?? 0) * rect.width,
      clientY: rect.top + (location?.y ?? 0) * rect.height,
    });

    expect(screen.getByTestId('info-popup')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next round|view results/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next round|view results/i }));
    expect(screen.getByText(/round 2\/10/i)).toBeInTheDocument();
  });
});
