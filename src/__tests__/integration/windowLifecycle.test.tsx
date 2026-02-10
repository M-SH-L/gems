import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { Taskbar } from '@/shell/Taskbar';
import { WindowManager } from '@/shell/WindowManager';
import { useWindowStore } from '@/shell/windowStore';

function TestShell() {
  return (
    <div style={{ position: 'relative', width: 1200, height: 800 }}>
      <WindowManager />
      <Taskbar />
    </div>
  );
}

describe('window lifecycle', () => {
  beforeEach(() => {
    useWindowStore.setState({ windows: [], nextZ: 1 });
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  });

  it('opens, minimizes, restores, maximizes, and closes windows', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestShell />);

    act(() => {
      useWindowStore.getState().open('fiction', 'Interactive Fiction');
    });

    expect(await screen.findByText('Coming soon...')).toBeInTheDocument();

    await user.click(screen.getByTitle('Minimize'));
    expect(screen.queryByText('Coming soon...')).not.toBeInTheDocument();

    const taskButton = screen.getByRole('button', { name: 'Interactive Fiction' });
    await user.click(taskButton);
    expect(await screen.findByText('Coming soon...')).toBeInTheDocument();

    await user.click(screen.getByTitle('Maximize'));
    expect(useWindowStore.getState().windows[0].maximized).toBe(true);

    await user.click(screen.getByTitle('Close'));
    expect(useWindowStore.getState().windows).toHaveLength(0);
  });

  it('focuses windows on pointer down', () => {
    renderWithProviders(<TestShell />);

    act(() => {
      useWindowStore.getState().open('fiction', 'Interactive Fiction');
      useWindowStore.getState().open('geography', 'Geography');
    });

    const windows = useWindowStore.getState().windows;
    const fiction = windows.find((w) => w.gameId === 'fiction');
    const geography = windows.find((w) => w.gameId === 'geography');

    expect(geography?.zIndex).toBeGreaterThan(fiction?.zIndex ?? 0);

    const fictionTitle = screen.getByText('Interactive Fiction', { selector: 'span' });
    fireEvent.pointerDown(fictionTitle);

    const updatedFiction = useWindowStore
      .getState()
      .windows.find((w) => w.gameId === 'fiction');
    const updatedGeography = useWindowStore
      .getState()
      .windows.find((w) => w.gameId === 'geography');

    expect(updatedFiction?.zIndex).toBeGreaterThan(updatedGeography?.zIndex ?? 0);
  });
});
