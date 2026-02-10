import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MenuBar } from '@/desktop/MenuBar';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { useWindowStore } from '@/shell/windowStore';

const initialState = useWindowStore.getState();

describe('MenuBar', () => {
  beforeEach(() => {
    useWindowStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows Desktop when no window is focused', () => {
    renderWithProviders(<MenuBar />);
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  it('shows the focused window title when a window is open', () => {
    useWindowStore.setState({
      windows: [
        {
          id: 'win-1',
          gameId: 'fiction',
          title: 'Interactive Fiction',
          x: 0,
          y: 0,
          width: 800,
          height: 600,
          minimized: false,
          maximized: false,
          zIndex: 2,
        },
      ],
    });

    renderWithProviders(<MenuBar />);
    expect(screen.getByText('Interactive Fiction')).toBeInTheDocument();
  });

  it('renders the clock, theme switcher, and volume control', () => {
    const now = new Date('2025-01-01T12:34:56Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    renderWithProviders(<MenuBar />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume')).toBeInTheDocument();
    expect(screen.getByText(now.toLocaleTimeString())).toBeInTheDocument();
  });
});
