import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FictionGame from '@/games/fiction/FictionGame';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { useTheme } from '@/theme/useTheme';

function ThemeHarness() {
  const { setTheme } = useTheme();
  return (
    <div>
      <button type="button" onClick={() => setTheme('futuristic')}>
        Switch Theme
      </button>
      <FictionGame />
    </div>
  );
}

describe('FictionGame', () => {
  it('renders the current scene text', () => {
    renderWithProviders(<FictionGame />);
    expect(
      screen.getByText(/pixelated gate/i)
    ).toBeInTheDocument();
  });

  it('advances to next scene on choice click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FictionGame />);

    await user.click(screen.getByRole('button', { name: /inspect the cracked gate/i }));
    expect(
      screen.getByText(/behind a loose brick/i)
    ).toBeInTheDocument();
  });

  it('shows items in the inventory sidebar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FictionGame />);

    await user.click(screen.getByRole('button', { name: /inspect the cracked gate/i }));
    const inventoryList = screen.getByRole('list');
    expect(within(inventoryList).getByText(/rusty key/i)).toBeInTheDocument();
    expect(screen.getByText(/inventory \(1\/5\)/i)).toBeInTheDocument();
  });

  it('resets when the theme changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeHarness />);

    await user.click(screen.getByRole('button', { name: /inspect the cracked gate/i }));
    expect(screen.getByText(/behind a loose brick/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /switch theme/i }));
    expect(
      await screen.findByText(/emergency protocols pull you online/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/theme changed/i)).toBeInTheDocument();
  });
});
