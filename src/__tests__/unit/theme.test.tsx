import { render, waitFor, act } from '@testing-library/react';
import { themes } from '@/theme/themes';
import { ThemeProvider } from '@/theme/ThemeContext';
import { useTheme } from '@/theme/useTheme';
import { useEffect } from 'react';

afterEach(() => {
  document.documentElement.style.cssText = '';
  document.documentElement.removeAttribute('data-theme');
});

const requiredVars = [
  '--color-bg',
  '--color-primary',
  '--color-accent',
  '--color-secondary',
  '--color-text',
  '--color-surface',
  '--font-theme',
  '--radius-theme',
  '--border-theme',
  '--shadow-theme',
  '--transition-speed',
];

describe('themes', () => {
  it('defines all required CSS variables', () => {
    for (const theme of themes) {
      for (const key of requiredVars) {
        expect(theme.vars[key]).toBeDefined();
      }
    }
  });

  it('keeps the same variable keys across themes', () => {
    const baseKeys = Object.keys(themes[0].vars).sort();
    for (const theme of themes) {
      expect(Object.keys(theme.vars).sort()).toEqual(baseKeys);
    }
  });
});

describe('ThemeProvider', () => {
  it('applies theme variables and data attribute to :root', async () => {
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        themes[0].id
      );
      expect(
        document.documentElement.style.getPropertyValue('--color-bg')
      ).toBe(themes[0].vars['--color-bg']);
    });
  });

  it('switches variables when setTheme is called', async () => {
    let switchTheme: ((id: (typeof themes)[number]['id']) => void) | null = null;

    function Grabber() {
      const { setTheme } = useTheme();
      useEffect(() => {
        switchTheme = setTheme;
      }, [setTheme]);
      return null;
    }

    render(
      <ThemeProvider>
        <Grabber />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        themes[0].id
      );
    });

    act(() => {
      switchTheme?.('futuristic');
    });

    const target = themes.find((theme) => theme.id === 'futuristic');
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('futuristic');
      expect(
        document.documentElement.style.getPropertyValue('--color-bg')
      ).toBe(target?.vars['--color-bg']);
    });
  });
});
