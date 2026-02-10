import { games } from './registry';
import { GameCard } from './GameCard';

export function DesktopGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 24,
        padding: 48,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
