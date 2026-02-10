import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/theme/useTheme';
import { MapCanvas } from './MapCanvas';
import { LocationPin } from './LocationPin';
import { InfoPopup } from './InfoPopup';
import { getGeoContent } from './content';
import { getRating, scoreGuess } from './scoring';
import type { GeoLocation, Point } from './types';

interface RoundResult {
  guess: Point;
  answer: GeoLocation;
  points: number;
  distance: number;
  band: 'perfect' | 'close' | 'near' | 'miss';
}

type Phase = 'guessing' | 'revealed' | 'complete';

function pickLocations(locations: GeoLocation[], rounds: number) {
  const pool = [...locations];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(rounds, pool.length));
}

export default function GeographyGame() {
  const { theme } = useTheme();
  const content = useMemo(() => getGeoContent(theme.id), [theme.id]);

  const [roundLocations, setRoundLocations] = useState<GeoLocation[]>(() =>
    pickLocations(content.locations, content.rounds)
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('guessing');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showResetNotice, setShowResetNotice] = useState(false);
  const hasMountedRef = useRef(false);

  const resetGame = useCallback(() => {
    setRoundLocations(pickLocations(content.locations, content.rounds));
    setRoundIndex(0);
    setPhase('guessing');
    setResults([]);
    setSelectedLocationId(null);
  }, [content.locations, content.rounds]);

  useEffect(() => {
    resetGame();
    let timer: number | undefined;
    if (hasMountedRef.current) {
      setShowResetNotice(true);
      timer = window.setTimeout(() => setShowResetNotice(false), 1200);
    } else {
      hasMountedRef.current = true;
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [content.id, resetGame]);

  const rounds = roundLocations.length;
  const currentLocation = roundLocations[roundIndex];
  const currentResult = results[roundIndex];
  const totalScore = results.reduce((sum, result) => sum + result.points, 0);

  const revealedLocations = useMemo(() => {
    const unique = new Map<string, GeoLocation>();
    results.forEach((result) => unique.set(result.answer.id, result.answer));
    return Array.from(unique.values());
  }, [results]);

  const selectedResult = selectedLocationId
    ? results.find((result) => result.answer.id === selectedLocationId)
    : undefined;

  const handleGuess = (point: Point) => {
    if (phase !== 'guessing' || !currentLocation) return;
    const scored = scoreGuess(point, currentLocation);
    setResults((prev) => {
      const next = [...prev];
      next[roundIndex] = {
        guess: point,
        answer: currentLocation,
        points: scored.points,
        distance: scored.distance,
        band: scored.band,
      };
      return next;
    });
    setPhase('revealed');
    setSelectedLocationId(currentLocation.id);
  };

  const handleNext = () => {
    if (roundIndex + 1 >= rounds) {
      setPhase('complete');
      return;
    }
    setRoundIndex((prev) => prev + 1);
    setPhase('guessing');
    setSelectedLocationId(null);
  };

  const promptLabel = currentLocation ? `Find: ${currentLocation.name}` : 'Exploration Complete';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'var(--font-theme)',
        color: 'var(--color-text)',
      }}
    >
      <header
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 'var(--border-theme)',
          background: 'var(--color-bg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ color: 'var(--color-primary)', fontSize: 14 }}>{content.name}</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>{content.quest}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 12 }}>Round {Math.min(roundIndex + 1, rounds)}/{rounds}</span>
          <span style={{ fontSize: 12, color: 'var(--color-secondary)' }}>Score: {totalScore}</span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', gap: 16, padding: 16, minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <MapCanvas
            map={content.map}
            background={content.mapBackground}
            onGuess={phase === 'guessing' ? handleGuess : undefined}
            line={
              currentResult
                ? { start: currentResult.guess, end: { x: currentResult.answer.x, y: currentResult.answer.y } }
                : undefined
            }
          >
            {currentResult && (
              <LocationPin
                point={currentResult.guess}
                themeId={content.id}
                variant="guess"
              />
            )}
            {revealedLocations.map((location) => (
              <LocationPin
                key={location.id}
                point={{ x: location.x, y: location.y }}
                themeId={content.id}
                variant="answer"
                label={location.name}
                onClick={() => setSelectedLocationId(location.id)}
              />
            ))}
          </MapCanvas>

          {showResetNotice && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'var(--color-primary)',
                fontSize: 12,
              }}
            >
              Theme changed — restarting
            </div>
          )}
        </div>

        <aside
          style={{
            width: 260,
            minWidth: 220,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: 'var(--border-theme)',
              borderRadius: 'var(--radius-theme)',
              padding: 12,
              boxShadow: 'var(--shadow-theme)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>{promptLabel}</div>
            {phase === 'guessing' && (
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
                Click the map to drop your pin.
              </div>
            )}
            {phase === 'revealed' && currentResult && (
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6 }}>
                Result: {currentResult.band.toUpperCase()} ({currentResult.points} pts)
              </div>
            )}
            {phase === 'complete' && (
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6 }}>
                Final Rating: {getRating(totalScore)}
              </div>
            )}
          </div>

          {phase === 'revealed' && (
            <button
              onClick={handleNext}
              style={primaryButton}
            >
              {roundIndex + 1 >= rounds ? 'View Results' : 'Next Round'}
            </button>
          )}

          {phase === 'complete' && (
            <button
              onClick={resetGame}
              style={primaryButton}
            >
              Play Again
            </button>
          )}

          {selectedResult && (
            <InfoPopup
              location={selectedResult.answer}
              distance={selectedResult.distance}
              points={selectedResult.points}
            />
          )}

          {!selectedResult && phase === 'guessing' && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: 'var(--border-theme)',
                borderRadius: 'var(--radius-theme)',
                padding: 12,
                boxShadow: 'var(--shadow-theme)',
                fontSize: 11,
                opacity: 0.7,
              }}
            >
              Make a guess to reveal the landmark details.
            </div>
          )}

          {revealedLocations.length > 0 && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: 'var(--border-theme)',
                borderRadius: 'var(--radius-theme)',
                padding: 12,
                boxShadow: 'var(--shadow-theme)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, opacity: 0.7 }}>Explore discovered landmarks:</span>
              {revealedLocations.map((location) => (
                <button
                  key={`list-${location.id}`}
                  onClick={() => setSelectedLocationId(location.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--color-primary)',
                    fontSize: 11,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {location.name}
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const primaryButton: CSSProperties = {
  background: 'var(--color-primary)',
  color: 'var(--color-bg)',
  border: 'none',
  borderRadius: 'var(--radius-theme)',
  padding: '10px 16px',
  fontFamily: 'var(--font-theme)',
  fontSize: '11px',
  cursor: 'pointer',
  fontWeight: 'bold',
};
