import { useTheme } from './useTheme';
import { themes } from './themes';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme.id}
      onChange={(e) => setTheme(e.target.value as typeof theme.id)}
      style={{
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        fontFamily: 'var(--font-theme)',
        padding: '4px 8px',
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      {themes.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
