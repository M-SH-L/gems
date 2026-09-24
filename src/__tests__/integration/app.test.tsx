import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('App', () => {
  it('wires the volume control to a mounted sound provider', async () => {
    render(<App />);

    const volume = screen.getByLabelText('Volume');
    expect(volume).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(volume);
    expect(volume).toHaveAttribute('aria-pressed', 'true');
    expect(volume).toHaveTextContent('MUTE');

    await userEvent.click(volume);
    expect(volume).toHaveAttribute('aria-pressed', 'false');
    expect(volume).toHaveTextContent('VOL');
  });
});
