import type { Point, ThemeId } from './types';

interface LocationPinProps {
  point: Point;
  themeId: ThemeId;
  variant: 'guess' | 'answer';
  label?: string;
  onClick?: () => void;
}

export function LocationPin({ point, themeId, variant, label, onClick }: LocationPinProps) {
  const size = variant === 'answer' ? 16 : 12;
  const color = variant === 'answer' ? 'var(--color-primary)' : 'var(--color-secondary)';

  const headStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: color,
    display: 'block',
  };

  if (themeId === 'futuristic') {
    headStyle.borderRadius = '50%';
    headStyle.boxShadow = `0 0 ${variant === 'answer' ? 12 : 6}px ${color}`;
  } else if (themeId === 'organic') {
    headStyle.borderRadius = '50% 50% 50% 0';
    headStyle.transform = 'rotate(-45deg)';
  } else {
    headStyle.borderRadius = 2;
    headStyle.boxShadow = `0 0 0 2px var(--color-text)`;
  }

  const stemStyle: React.CSSProperties = {
    width: themeId === 'organic' ? 4 : 2,
    height: themeId === 'organic' ? 10 : 8,
    background: color,
    margin: '0 auto',
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      title={label}
      aria-label={label}
      data-testid={`pin-${variant}`}
      style={{
        position: 'absolute',
        left: `${point.x * 100}%`,
        top: `${point.y * 100}%`,
        transform: 'translate(-50%, -90%)',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        pointerEvents: onClick ? 'auto' : 'none',
      }}
    >
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={headStyle} />
        <span style={stemStyle} />
      </span>
    </button>
  );
}
