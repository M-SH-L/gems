import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '@/App';
import { useWindowStore } from '@/shell/windowStore';

const initialState = useWindowStore.getState();

describe('V1 ↔ V2 portal', () => {
  beforeEach(() => {
    useWindowStore.setState(initialState, true);
    window.history.replaceState(null, '', '/');
  });

  it('opens on the V1 desktop with a portal into V2', () => {
    render(<App />);
    expect(screen.getByText('Interactive Fiction')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter Gems V2' })).toBeInTheDocument();
    expect(screen.queryByTestId('v2-root')).not.toBeInTheDocument();
  });

  it('plays the portal animation, lands in V2 and can travel back to V1', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Enter Gems V2' }));
    expect(screen.getByTestId('portal-transition')).toBeInTheDocument();

    // jsdom has no WebGL, so V2 shows its graceful fallback once it arrives.
    await waitFor(() => expect(screen.getByTestId('v2-root')).toBeInTheDocument(), { timeout: 8000 });
    expect(window.location.hash).toBe('#v2');
    await waitFor(() => expect(screen.queryByTestId('portal-transition')).not.toBeInTheDocument(), { timeout: 4000 });
    expect(await screen.findByText('3D unavailable')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to V1' }));
    await waitFor(() => expect(screen.getByText('Interactive Fiction')).toBeInTheDocument(), { timeout: 8000 });
    expect(screen.queryByTestId('v2-root')).not.toBeInTheDocument();
    expect(window.location.hash).toBe('');
  }, 20000);

  it('deep-links straight into V2 with #v2', async () => {
    window.history.replaceState(null, '', '/#v2');
    render(<App />);
    expect(await screen.findByTestId('v2-root', {}, { timeout: 8000 })).toBeInTheDocument();
  }, 10000);
});
