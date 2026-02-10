import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameCard } from '@/desktop/GameCard';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { games } from '@/games/registry';
import { useWindowStore } from '@/shell/windowStore';

const initialState = useWindowStore.getState();

beforeEach(() => {
  useWindowStore.setState(initialState, true);
});

describe('GameCard', () => {
  it('renders the game details and play button', () => {
    const game = games[0];
    renderWithProviders(<GameCard game={game} />);

    expect(screen.getByText(game.title)).toBeInTheDocument();
    expect(screen.getByText(game.description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play now/i })).toBeInTheDocument();
  });

  it('calls window open when Play Now is clicked', async () => {
    const open = vi.fn();
    useWindowStore.setState({ open });

    const game = games[0];
    renderWithProviders(<GameCard game={game} />);

    await userEvent.click(screen.getByRole('button', { name: /play now/i }));

    expect(open).toHaveBeenCalledWith(game.id, game.title);
  });
});
