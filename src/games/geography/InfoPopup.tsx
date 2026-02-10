import type { GeoLocation } from './types';

interface InfoPopupProps {
  location: GeoLocation;
  distance?: number;
  points?: number;
}

export function InfoPopup({ location, distance, points }: InfoPopupProps) {
  return (
    <div
      data-testid="info-popup"
      style={{
        background: 'var(--color-surface)',
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        padding: 16,
        boxShadow: 'var(--shadow-theme)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--color-primary)' }}>{location.name}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{location.description}</div>
      {location.funFact && (
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          Fun fact: {location.funFact}
        </div>
      )}
      {(distance !== undefined || points !== undefined) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            opacity: 0.8,
          }}
        >
          <span>{distance !== undefined ? `Distance: ${(distance * 100).toFixed(1)}%` : ''}</span>
          <span>{points !== undefined ? `Points: ${points}` : ''}</span>
        </div>
      )}
    </div>
  );
}
