# Game 3: Platformer — "Pixel Runner"

## Concept

A classic side-scrolling platformer. Run, jump, collect items, avoid hazards, reach the goal. 3 levels per theme variant with increasing difficulty.

## Theme Variants

### Retro — "Block Dash"
- **World**: Classic 8-bit pixel blocks — brown ground, blue sky, green pipes, red lava
- **Player**: Small square character with simple 2-frame walk animation
- **Collectibles**: Gold coins (yellow squares)
- **Hazards**: Spikes (triangles), moving enemies (bouncing red squares)
- **Levels**:
  - L1: Flat terrain with gaps
  - L2: Vertical climbs + moving platforms
  - L3: Enemy gauntlet + precision jumps

### Futuristic — "Neon Surge"
- **World**: Dark background with glowing neon outlines, cyan platforms, magenta hazards
- **Player**: Glowing diamond shape with trail effect
- **Collectibles**: Energy orbs (cyan circles with glow)
- **Hazards**: Laser beams (horizontal red lines that pulse), floating drones (magenta diamonds)
- **Levels**:
  - L1: Neon corridors
  - L2: Laser timing puzzles
  - L3: Drone chase sequence

### Organic — "Leaf Leap"
- **World**: Earthy browns and greens, rounded platforms (logs, mushrooms, lily pads)
- **Player**: Small seed/sprout character
- **Collectibles**: Dewdrops (blue teardrops)
- **Hazards**: Thorns (green spikes), falling rocks (brown circles), poison flowers (purple)
- **Levels**:
  - L1: Forest floor
  - L2: Mushroom canopy climb
  - L3: River crossing with moving lily pads

## Mechanics

### Controls
- Arrow keys: left/right move, up = jump
- WASD alternative: A/D move, W = jump
- Space = jump (alternate)

### Physics
- Gravity constant pulls player downward each frame
- Jump impulse: instant upward velocity when on ground
- No horizontal momentum (instant stop for tight, responsive controls)

### Collision System
- Tile-based AABB collision
- Grid of tiles, each 32x32px
- Tile types: air, ground, collectible, hazard, goal, moving platform

### Lives & Respawn
- 3 lives per level
- Hazard contact = lose 1 life, respawn at level start
- Level 3: checkpoint system, respawn at last checkpoint
- 0 lives = game over, restart level

### Scoring
- Collectibles x 10 points
- Time bonus: faster completion = more points

### Level Completion
- Touch the goal tile to complete level
- Brief "Level Complete" overlay with score breakdown
- Advances to next level

### Camera
- Horizontal scroll following player
- Player stays at ~40% of screen width
- Camera clamped to level bounds

## Technical Implementation

### Architecture
- **Canvas-based** rendering at 60fps via `requestAnimationFrame`
- Game state stored in `useRef` (NOT React state) to avoid 60 re-renders/sec
- React HUD overlay reads from ref, polled every 200ms

### Files
- `engine.ts` — Game loop: `update(dt)` applies physics + collision, reads input state
- `renderer.ts` — `render(state, ctx)` draws tiles and entities as colored rectangles/shapes. Theme determines color palette and shape style
- `entities.ts` — Player, Collectible, Hazard, Platform types with position/velocity/sprite properties
- `levels.ts` — Parses 2D tile arrays from content files into entity lists
- `PlatformerGame.tsx` — Mounts `<canvas>`, overlays React HUD (score, lives, level)
- `content/retro.ts`, `content/futuristic.ts`, `content/organic.ts` — Level tile arrays (2D number grids) + color/shape definitions

### Input System
- `keydown`/`keyup` listeners on `window`
- Pressed keys stored in `Set<string>` ref
- Engine reads key set each frame

### Rendering by Theme
- **Retro**: Sharp rectangles, no anti-aliasing feel, bright solid colors
- **Futuristic**: Glowing outlines, neon colors, trail effects
- **Organic**: Rounded shapes, earthy colors, soft edges
