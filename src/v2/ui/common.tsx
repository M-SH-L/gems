import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * HUD button that doesn't steal keyboard focus on click, so Space/Enter keep
 * driving the game instead of re-clicking the last button.
 */
export function HudButton({ variant, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'icon' }) {
  const cls = ['v2-btn', variant === 'primary' && 'v2-btn-primary', variant === 'icon' && 'v2-btn-icon', className]
    .filter(Boolean)
    .join(' ');
  return <button type="button" className={cls} onMouseDown={(e) => e.preventDefault()} {...rest} />;
}

export function Stat({ label, value, children }: { label: string; value: ReactNode; children?: ReactNode }) {
  return (
    <div className="v2-glass v2-stat">
      <div className="v2-stat-label">{label}</div>
      <div className="v2-stat-value">{value}</div>
      {children}
    </div>
  );
}
