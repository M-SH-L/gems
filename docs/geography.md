# Game 2: Geography — "Pin & Discover"

## Concept

A map-based game combining location guessing with landmark exploration. Player is given a prompt ("Find the Great Barrier Reef"), clicks the map to guess, gets scored on accuracy, then sees an info popup about the landmark.

## Theme Variants

### Retro — "Arcade Atlas"
- **Map**: Pixel-art SVG world map with chunky country outlines in neon green on dark bg
- **Quest**: Find hidden retro arcade cabinets and gaming landmarks around the world
- **Locations** (10-15): Tokyo Game District, Silicon Valley, Atari HQ (Sunnyvale), Nokia HQ (Espoo), Tetris origin (Moscow), Pac-Man birthplace (Tokyo), Space Invaders origin (Osaka), Nintendo HQ (Kyoto), etc.
- **Pin style**: Pixel flag marker
- **Info popups**: Retro terminal-style text boxes

### Futuristic — "Star Navigator"
- **Map**: Custom SVG star chart with connected nodes (fictional star systems)
- **Quest**: Navigate between star systems to locate space stations and anomalies
- **Locations** (10-15): Alpha Station (trade hub), Nebula Research Lab, Dyson Ring, Warp Gate Nexus, Crystal Planet, etc.
- **Pin style**: Holographic beacon marker
- **Info popups**: Holographic data panels

### Organic — "Wild Atlas"
- **Map**: Earthy-toned SVG world map with organic hand-drawn country borders
- **Quest**: Discover rare ecosystems and natural wonders
- **Locations** (10-15): Great Barrier Reef, Amazon Rainforest, Galapagos Islands, Serengeti, Dead Sea, Northern Lights (Iceland), Redwood Forest, Zhangjiajie Pillars, etc.
- **Pin style**: Leaf/seed pin marker
- **Info popups**: Parchment-style cards with nature illustrations

## Mechanics

### Round System
- 10 rounds per game, one location per round
- Locations selected randomly from the theme's location pool

### Guessing
- Player clicks anywhere on the map to place their pin
- Distance calculated as Euclidean in normalized (0-1) coordinate space

### Scoring
| Accuracy | Points |
|----------|--------|
| Within 3% of map (perfect) | 100 |
| Within 10% (close) | 50 |
| Within 20% (near) | 25 |
| Beyond 20% | 0 |

### Reveal Phase
- After guessing, show correct location with themed marker
- Draw line between guess and answer
- Display distance and points earned
- Show info popup with landmark description

### End Game
- Total score = sum of all rounds
- Rating: Explorer (0-300) / Navigator (301-700) / Master (701-1000)

### Explore Mode
- After completing a round, player can click revealed landmarks to read more info

## Technical Implementation

### Files
- `MapCanvas.tsx` — Renders SVG, handles click-to-pin, normalizes coordinates to 0-1 range
- `LocationPin.tsx` — Themed pin component (absolutely positioned over SVG)
- `InfoPopup.tsx` — Themed popup card with landmark description
- `GeographyGame.tsx` — Manages round state, scoring, reveal logic
- `content/retro.ts`, `content/futuristic.ts`, `content/organic.ts` — Export `GeoContent` with locations array, map SVG reference, scoring config

### Map Assets
- World SVG from Natural Earth (public domain) for Retro and Organic variants
- Custom hand-made SVG star chart for Futuristic variant
- No external map libraries — plain SVG as static assets

### Location Data Structure
```typescript
{
  id: string;
  name: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  description: string;
  funFact?: string;
}
```
