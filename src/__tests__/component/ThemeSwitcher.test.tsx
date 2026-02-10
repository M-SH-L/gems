import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcher } from '@/theme/ThemeSwitcher';
import { themes } from '@/theme/themes';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';

afterEach(() => {
  document.documentElement.style.cssText = '';
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeSwitcher', () => {
  it('renders all theme options', () => {
    renderWithProviders(<ThemeSwitcher />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(themes.length);
    for (const theme of themes) {
      expect(screen.getByRole('option', { name: theme.name })).toBeInTheDocument();
    }
  });

  it('updates the theme when a new option is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);

    await user.selectOptions(screen.getByRole('combobox'), 'futuristic');
    const target = themes.find((theme) => theme.id === 'futuristic');

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('futuristic');
      expect(
        document.documentElement.style.getPropertyValue('--color-bg')
      ).toBe(target?.vars['--color-bg']);
    });
  });
});
