import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { WindowFrame } from '@/shell/WindowFrame';
import { useWindowStore, type WindowState } from '@/shell/windowStore';

const baseWin: WindowState = {
  id: 'win-test',
  gameId: 'fiction',
  title: 'Interactive Fiction',
  x: 120,
  y: 80,
  width: 800,
  height: 600,
  minimized: false,
  maximized: false,
  zIndex: 1,
};

describe('WindowFrame', () => {
  beforeEach(() => {
    useWindowStore.setState({ windows: [baseWin], nextZ: 2 });
  });

  it('renders title bar controls and game content', async () => {
    renderWithProviders(<WindowFrame win={baseWin} />);

    expect(screen.getByTitle('Minimize')).toBeInTheDocument();
    expect(screen.getByTitle('Maximize')).toBeInTheDocument();
    expect(screen.getByTitle('Close')).toBeInTheDocument();

    expect(await screen.findByText('Coming soon...')).toBeInTheDocument();
  });

  it('controls update window state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WindowFrame win={baseWin} />);

    await user.click(screen.getByTitle('Minimize'));
    expect(useWindowStore.getState().windows[0].minimized).toBe(true);

    await user.click(screen.getByTitle('Maximize'));
    expect(useWindowStore.getState().windows[0].maximized).toBe(true);

    await user.click(screen.getByTitle('Close'));
    expect(useWindowStore.getState().windows).toHaveLength(0);
  });
});
