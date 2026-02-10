import React, { useEffect } from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BuilderGame from '@/games/builder/BuilderGame';
import { builderContentByTheme } from '@/games/builder/content';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { useTheme } from '@/theme/useTheme';

let setThemeRef: ((id: 'retro' | 'futuristic' | 'organic') => void) | null = null;

function ThemeGrabber() {
  const { setTheme } = useTheme();
  useEffect(() => {
    setThemeRef = setTheme;
  }, [setTheme]);
  return null;
}

describe('BuilderGame', () => {
  it('renders a 12x12 grid', () => {
    renderWithProviders(<BuilderGame />);
    const cells = screen.getAllByTestId(/builder-cell-/);
    expect(cells).toHaveLength(144);
  });

  it('shows palette items', () => {
    renderWithProviders(<BuilderGame />);
    const items = builderContentByTheme.retro.items;
    for (const item of items) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }
  });

  it('places an item when selected', async () => {
    renderWithProviders(<BuilderGame />);
    const firstItem = builderContentByTheme.retro.items[0];
    const itemButton = screen.getByText(firstItem.name).closest('button');

    expect(itemButton).toBeTruthy();
    if (!itemButton) return;

    await userEvent.click(itemButton);
    expect(itemButton).toHaveAttribute('aria-pressed', 'true');

    const cell = screen.getByTestId('builder-cell-0-0');
    await userEvent.click(cell);

    expect(cell).toHaveTextContent(firstItem.icon);
  });

  it('shows budget and score panels', () => {
    renderWithProviders(<BuilderGame />);

    expect(screen.getByText(/budget/i)).toBeInTheDocument();
    expect(screen.getByText(/happiness score/i)).toBeInTheDocument();
  });

  it('resets the grid on theme change', async () => {
    renderWithProviders(
      <>
        <ThemeGrabber />
        <BuilderGame />
      </>
    );

    const firstItem = builderContentByTheme.retro.items[0];
    const itemButton = screen.getByText(firstItem.name).closest('button');
    expect(itemButton).toBeTruthy();
    if (!itemButton) return;

    await userEvent.click(itemButton);
    const cell = screen.getByTestId('builder-cell-0-0');
    await userEvent.click(cell);
    expect(cell).toHaveTextContent(firstItem.icon);

    act(() => {
      setThemeRef?.('futuristic');
    });

    await waitFor(() => {
      expect(cell).toHaveTextContent('');
    });
  });
});
