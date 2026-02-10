# Game Hub + 5 Mini Games — Implementation Plan

## Overview

A simulated desktop OS environment hosting 5 theme-switchable mini games. Three baked-in themes (Retro, Futuristic, Organic) affect everything: UI chrome, game content/assets, animations, and sounds. Built with Vite + React + TypeScript + Tailwind CSS. No backend.

---

## Tech Stack & Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| react + react-dom | UI framework | ~40KB |
| zustand | Window manager state | ~2KB |
| clsx + tailwind-merge | Class utilities | ~6KB |
| vite | Build tool | dev only |
| tailwindcss + postcss | CSS framework | dev only |
| typescript | Type checking | dev only |
| vitest | Unit/integration testing | dev only |
| @testing-library/react | Component testing | dev only |
| @testing-library/user-event | User interaction simulation | dev only |
| jsdom | DOM environment for tests | dev only |
| playwright | E2E browser testing | dev only |

No map libraries, no game engines, no animation libraries. Total added runtime JS beyond React: ~8KB.

---

## Theme Engine

### Architecture
- **CSS Custom Properties** on `:root` — colors, fonts, radii, borders, shadows, transition speed
- **ThemeContext** (React Context) — holds active theme, applies CSS vars to `document.documentElement` on change
- **Tailwind config** — extends colors/fonts/radii to reference CSS vars (`bg-primary`, `text-accent`, `font-theme`, `rounded-theme`)
- **Content maps** — each game indexes `content[theme.id]` to load theme-specific stories, levels, assets
- **Smooth transitions** — CSS `transition` on themed properties + brief fade overlay during switch
- **Overlay effects** — Retro: CSS scanlines pseudo-element; Futuristic: holographic shimmer; Organic: paper grain texture

### Theme Definitions

**Retro**: `#0a0a0a` bg, `#39ff14` neon accent, `#ff6600` secondary, Press Start 2P font, 0px border-radius, 2px solid borders, CRT scanline overlay, 8-bit beep sounds

**Futuristic**: `#0b0e1a` bg, `#00e5ff` cyan accent, `#e040fb` magenta secondary, Orbitron font, 12px border-radius, 1px borders with glow, holographic shimmer overlay, synth tone sounds

**Organic**: `#f5f0e8` bg, `#2d6a4f` green accent, `#d4a373` amber secondary, Caveat handwritten font, 20px organic border-radius, dashed/hand-drawn borders, paper grain overlay, nature click/rustle sounds

### Theme Switch Behavior in Games
When theme changes mid-game, the game resets with a brief "Theme changed — restarting" message. This avoids impossible state mapping between different content sets.

---

## Desktop Shell (Game Hub)

### Components
- **Desktop.tsx** — Full-viewport simulated OS. Theme-aware background (dark static for retro, gradient mesh for futuristic, paper texture for organic)
- **MenuBar.tsx** — Top bar: live clock (HH:MM:SS + date), focused window title (or "Desktop"), ThemeSwitcher dropdown, volume control icon
- **DesktopGrid.tsx** — Centered grid of 5 GameCards
- **GameCard.tsx** — Card with game icon, title, 1-line description, "Play Now" button. Styled per theme (pixel borders / glass panels / leaf-bordered)

### Window Manager
- **windowStore.ts** (Zustand) — Array of `WindowState` objects: `{ id, gameId, title, x, y, width, height, minimized, maximized, zIndex }`
- **WindowManager.tsx** — Renders `WindowFrame` for each open window, layered over desktop
- **WindowFrame.tsx** — Draggable (title bar pointer events), resizable (corner handle), title bar with minimize/maximize/close buttons. Min size 400x300, max = viewport
- **Z-ordering** — `focus(id)` sets `zIndex = nextZIndex++`
- **Minimize** — Hidden, shown as small button in bottom taskbar. Click to restore
- **Maximize** — Fills desktop area below MenuBar. Toggle to restore previous size/position
- Opening a game that's already open focuses + restores it instead of creating a duplicate

---

## Game 1: Interactive Fiction

### Concept
A text-based adventure with branching narrative, inventory system, and 15-20 scenes per theme variant. Player reads scene descriptions and picks from 2-4 choices. Some paths require specific inventory items.

### Theme Variants

**Retro — "Dungeon of the Pixel King"**
- Setting: Classic dungeon crawl beneath a pixelated castle
- Story: Explore a glitching dungeon to find the Pixel King's lost crown. Navigate trap rooms, solve riddles from 8-bit NPCs, collect keys and potions
- Inventory items: Rusty Key, Health Potion, Torch, Magic Scroll, Pixel Sword
- Win condition: Reach the throne room with the crown

**Futuristic — "Station Zero"**
- Setting: Abandoned space station orbiting a dying star
- Story: You're a maintenance AI that wakes up to find the crew missing. Investigate labs, crew quarters, and the bridge to uncover what happened. Piece together logs, override locked doors, reroute power
- Inventory items: Access Card, Power Cell, Data Chip, Plasma Cutter, Emergency Beacon
- Win condition: Discover the truth and activate the emergency beacon

**Organic — "Whispers of the Grove"**
- Setting: An ancient living forest with sentient plants
- Story: You're a seedling spirit tasked with healing a corrupted Great Tree. Travel through mushroom caves, river deltas, and canopy villages. Gather natural remedies and earn trust of forest creatures
- Inventory items: Healing Pollen, River Stone, Firefly Lantern, Root Key, Blossom Charm
- Win condition: Reach the Great Tree's heart and apply the remedies

### Mechanics
- **Scene engine**: State machine — current scene ID + inventory set
- **Scene data**: `{ id, text, choices: [{ label, nextScene, requiredItem?, itemGained? }] }`
- **Inventory**: Max 5 items, displayed in sidebar. Items unlock specific choices
- **Progression**: ~15-20 scenes per variant, 2-3 branching paths, 1 optimal path, 1-2 dead ends (with retry)
- **UI**: Scene text in a scrollable area (styled as terminal for retro, holographic panel for futuristic, parchment scroll for organic), choice buttons below, inventory sidebar

### Tech Implementation
- `FictionEngine.ts` — Pure functions: `getScene(state)`, `makeChoice(state, choiceIndex) => newState`
- `FictionGame.tsx` — `useReducer` with `{ currentScene, inventory, history }` state
- `Inventory.tsx` — Reads inventory from game state, renders themed item cards
- `content/retro.ts`, `content/futuristic.ts`, `content/organic.ts` — Export `FictionContent` objects
- Theme switch triggers state reset via `useEffect` watching `theme.id`

---

## Game 2: Geography — "Pin & Discover"

### Concept
A map-based game combining location guessing with landmark exploration. Player is given a prompt ("Find the Great Barrier Reef"), clicks the map to guess, gets scored on accuracy, then sees an info popup about the landmark.

### Theme Variants

**Retro — "Arcade Atlas"**
- Map: Pixel-art SVG world map with chunky country outlines in neon green on dark bg
- Quest: Find hidden retro arcade cabinets and gaming landmarks around the world
- Locations (10-15): Tokyo Game District, Silicon Valley, Atari HQ (Sunnyvale), Nokia HQ (Espoo), Tetris origin (Moscow), Pac-Man birthplace (Tokyo), Space Invaders origin (Osaka), Nintendo HQ (Kyoto), etc.
- Pin style: Pixel flag marker
- Info popups: Retro terminal-style text boxes

**Futuristic — "Star Navigator"**
- Map: Custom SVG star chart with connected nodes (fictional star systems)
- Quest: Navigate between star systems to locate space stations and anomalies
- Locations (10-15): Alpha Station (trade hub), Nebula Research Lab, Dyson Ring, Warp Gate Nexus, Crystal Planet, etc.
- Pin style: Holographic beacon marker
- Info popups: Holographic data panels

**Organic — "Wild Atlas"**
- Map: Earthy-toned SVG world map with organic hand-drawn country borders
- Quest: Discover rare ecosystems and natural wonders
- Locations (10-15): Great Barrier Reef, Amazon Rainforest, Galápagos Islands, Serengeti, Dead Sea, Northern Lights (Iceland), Redwood Forest, Zhangjiajie Pillars, etc.
- Pin style: Leaf/seed pin marker
- Info popups: Parchment-style cards with nature illustrations

### Mechanics
- **Round-based**: 10 rounds per game, one location per round
- **Guessing**: Click anywhere on map to place your pin. Distance calculated as Euclidean in normalized (0-1) coordinate space
- **Scoring**: Perfect (within 3% of map) = 100pts, Close (within 10%) = 50pts, Near (within 20%) = 25pts, else 0
- **Reveal**: After guessing, show correct location, draw line between guess and answer, show distance, display info popup with landmark description
- **Total score**: Sum of all rounds, shown at end with rating (Explorer / Navigator / Master)
- **Explore mode**: After completing a round, player can click revealed landmarks to read more info

### Tech Implementation
- No map library — plain SVG maps as static assets
- `MapCanvas.tsx` — Renders SVG, handles click-to-pin, normalizes coordinates
- `LocationPin.tsx` — Themed pin component (absolutely positioned over SVG)
- `InfoPopup.tsx` — Themed popup card with landmark description
- `GeographyGame.tsx` — Manages round state, scoring, reveal logic
- `content/*.ts` — Export `GeoContent` with locations array, map SVG reference, scoring config
- World SVG from Natural Earth (public domain). Star map is a custom hand-made SVG

---

## Game 3: Platformer — "Pixel Runner"

### Concept
A classic side-scrolling platformer. Run, jump, collect items, avoid hazards, reach the goal. 3 levels per theme variant with increasing difficulty.

### Theme Variants

**Retro — "Block Dash"**
- World: Classic 8-bit pixel blocks — brown ground, blue sky, green pipes, red lava
- Player: Small square character with simple 2-frame walk animation
- Collectibles: Gold coins (yellow squares)
- Hazards: Spikes (triangles), moving enemies (bouncing red squares)
- Levels: L1 = flat with gaps, L2 = vertical climbs + moving platforms, L3 = enemy gauntlet + precision jumps

**Futuristic — "Neon Surge"**
- World: Dark background with glowing neon outlines, cyan platforms, magenta hazards
- Player: Glowing diamond shape with trail effect
- Collectibles: Energy orbs (cyan circles with glow)
- Hazards: Laser beams (horizontal red lines that pulse), floating drones (magenta diamonds)
- Levels: L1 = neon corridors, L2 = laser timing puzzles, L3 = drone chase sequence

**Organic — "Leaf Leap"**
- World: Earthy browns and greens, rounded platforms (logs, mushrooms, lily pads)
- Player: Small seed/sprout character
- Collectibles: Dewdrops (blue teardrops)
- Hazards: Thorns (green spikes), falling rocks (brown circles), poison flowers (purple)
- Levels: L1 = forest floor, L2 = mushroom canopy climb, L3 = river crossing with moving lily pads

### Mechanics
- **Controls**: Arrow keys (left/right move, up = jump) or WASD. Space = jump alt
- **Physics**: Gravity constant, jump impulse, no horizontal momentum (instant stop for tight controls)
- **Collision**: Tile-based AABB. Grid of tiles, each 32x32px. Tile types: air, ground, collectible, hazard, goal, moving platform
- **Lives**: 3 lives per level. Hazard contact = lose life, respawn at level start (or last checkpoint on L3)
- **Scoring**: Collectibles × 10pts + time bonus (faster = more points)
- **Level completion**: Touch the goal tile. Brief "Level Complete" overlay, then next level
- **Camera**: Horizontal scroll following player. Player stays at ~40% of screen width. Clamp to level bounds

### Tech Implementation
- **Canvas-based** rendering at 60fps via `requestAnimationFrame`
- `engine.ts` — Game loop: `update(dt)` applies physics + collision, reads input state. `GameState` stored in `useRef` (NOT React state) to avoid 60 re-renders/sec
- `renderer.ts` — `render(state, ctx)` draws tiles and entities as colored rectangles/shapes. Theme determines color palette and shape style (sharp rects for retro, glowing outlines for futuristic, rounded shapes for organic)
- `entities.ts` — Player, Collectible, Hazard, Platform types with position/velocity/sprite properties
- `levels.ts` — Parses 2D tile arrays from content files into entity lists
- `PlatformerGame.tsx` — Mounts `<canvas>`, overlays React HUD (score, lives, level). HUD reads from a ref polled every 200ms
- `content/*.ts` — Export level tile arrays (2D number grids) + color/shape definitions
- Input: `keydown`/`keyup` listeners on `window`, pressed keys stored in `Set<string>` ref

---

## Game 4: Building/Simulation — "World Builder"

### Concept
A 2D top-down grid-based builder. Drag items from a palette onto a grid to create a themed environment. Simple resource budget and adjacency-based scoring.

### Theme Variants

**Retro — "Pixel Town"**
- Building: A small pixel village with houses, shops, roads, parks
- Palette items (10): House, Shop, Road, Park, Well, Tavern, Wall, Farm, Tower, Bridge
- Grid: 12x12, green pixel grass background
- Scoring: Happiness score. Houses near parks +bonus, shops near roads +bonus, tavern near houses +bonus

**Futuristic — "Station Architect"**
- Building: A space station with modules, corridors, and systems
- Palette items (10): Crew Quarters, Lab, Corridor, Airlock, Power Core, Medbay, Storage, Comms Array, Reactor, Garden Dome
- Grid: 12x12, dark space background with star dots
- Scoring: Efficiency score. Quarters near medbay +bonus, lab near power core +bonus, all modules connected via corridors required

**Organic — "Garden of Life"**
- Building: A garden ecosystem with plants, water, and wildlife areas
- Palette items (10): Flower Bed, Tree, Pond, Path, Bench, Beehive, Herb Garden, Bird Bath, Trellis, Compost
- Grid: 12x12, earthy brown soil background
- Scoring: Biodiversity score. Trees near ponds +bonus, beehives near flower beds +bonus, paths connecting areas +bonus

### Mechanics
- **Grid**: 12x12 cells. Each cell holds 0 or 1 item. Items are 1x1
- **Palette**: Scrollable sidebar with all available items. Each shows name, icon (colored square/symbol), cost
- **Budget**: Start with 100 credits. Each item costs 5-15 credits. Removing items refunds cost
- **Placement**: Click palette item to select, click grid cell to place. Or drag from palette onto grid
- **Removal**: Right-click or select eraser tool, then click cell
- **Adjacency scoring**: After each placement, recalculate score. Each item type has adjacency bonuses (JSON config in content file)
- **Completion**: No explicit "end" — player builds until satisfied or runs out of budget. Show running score and "Best Score" from localStorage
- **Visual**: Items rendered as themed colored tiles with simple emoji or symbol overlays

### Tech Implementation
- `Grid.tsx` — CSS grid of div cells (12x12 is fine for DOM, no canvas needed). Each cell styled based on content. Click/drop handlers
- `Palette.tsx` — Sidebar list of items, click to select or drag
- `ScorePanel.tsx` — Shows budget remaining, current score, adjacency breakdown
- `BuilderGame.tsx` — Orchestrates state: `{ grid: (Item|null)[][], selectedItem, budget, score }`
- `content/*.ts` — Export `BuilderContent` with item definitions, adjacency rules, grid background style
- State managed with `useReducer` — actions: PLACE_ITEM, REMOVE_ITEM, SELECT_ITEM
- Score calculation: Pure function iterating grid, checking each cell's neighbors against adjacency bonus map

---

## Game 5: Circuit Puzzle — "Connect"

### Concept
A grid-based path-drawing puzzle. Connect source nodes to matching target nodes by drawing paths along grid edges. Paths cannot cross. Increasing complexity across 5 levels per theme.

### Theme Variants

**Retro — "Chip Fix"**
- Visual: Green PCB board with copper traces, component nodes as IC chips
- Nodes styled as: red/blue/yellow/green square chips with pin markings
- Paths: Copper-colored traces with solder points at turns
- Background: Dark green PCB texture with drill holes pattern

**Futuristic — "Power Grid"**
- Visual: Dark grid with glowing energy conduits
- Nodes styled as: Cyan/magenta/gold/lime glowing power cores
- Paths: Animated glowing lines with energy pulse traveling along them
- Background: Dark metallic surface with subtle hex grid

**Organic — "Root Network"**
- Visual: Underground cross-section with soil layers
- Nodes styled as: Colored seed pods (red berry/blue mushroom/yellow flower/green sprout)
- Paths: Brown root tendrils that grow along the path
- Background: Earthy soil gradient with small rock and worm details

### Mechanics
- **Grid**: Varies by level — L1: 5x5, L2: 6x6, L3: 7x7, L4: 8x8, L5: 9x9
- **Nodes**: Each level has 2-5 pairs of colored source/target nodes placed on grid cells
- **Path drawing**: Click a source node, then click/drag through adjacent empty cells to draw a path to the matching target node. Paths follow grid lines (horizontal/vertical only, no diagonals)
- **Rules**: Paths cannot cross each other. Paths cannot pass through nodes that aren't the matching target. Every cell must be filled (flow-puzzle style) on harder levels (L4-L5)
- **Validation**: Level is complete when all pairs are connected with valid non-crossing paths
- **Undo**: Click on an existing path to clear it and redraw
- **Hints**: Optional — highlight one correct path segment (limited to 3 hints per game)
- **Timer**: Time tracked but not enforced. Shown as a subtle counter. Best times saved to localStorage

### Tech Implementation
- `PuzzleGrid.tsx` — SVG-based grid. Cells as `<rect>`, nodes as styled `<circle>`/`<rect>`, paths as `<line>` segments
- `PathDrawer.tsx` — Handles pointer events: mousedown on source starts a path, mousemove through adjacent cells extends path, mouseup on matching target completes path. Validates no-crossing on each extension
- `CircuitGame.tsx` — Manages state: `{ grid, paths: Map<colorId, Cell[]>, activeColor, level, timer }`
- `content/*.ts` — Export `PuzzleContent` with level definitions: `{ gridSize, nodes: { color, source: [r,c], target: [r,c] }[], blockedCells?: [r,c][] }`
- State: `useReducer` with actions START_PATH, EXTEND_PATH, COMPLETE_PATH, CLEAR_PATH, NEXT_LEVEL
- Crossing detection: Maintain a `Set<"r,c">` of occupied cells. Before extending, check if target cell is occupied by another color's path

---

## Sound System

### Architecture
- `SoundContext.tsx` — Singleton `AudioContext` (Web Audio API), lazy-initialized on first user click
- `soundMap.ts` — Maps `(themeId, action)` → file path
- `useSound.ts` — Hook: `play('click')` resolves theme automatically
- Sound files: Short WAV/MP3 clips (<50KB each), stored in `public/sounds/{theme}/`

### Sound Actions
| Action | Trigger | Retro | Futuristic | Organic |
|--------|---------|-------|------------|---------|
| click | UI button press | 8-bit blip | Soft synth tap | Wooden tap |
| open | Window opens | Chiptune rise | Whoosh + hum | Leaf rustle |
| close | Window closes | 8-bit descend | Fade-out tone | Soft thud |
| game_start | Game begins | Fanfare beeps | Synth chord | Bird chirp |
| collect | Item collected | Coin ding | Energy pulse | Dewdrop |
| place | Builder placement | Block thunk | Magnetic lock | Soil pat |
| connect | Circuit path done | Circuit buzz | Power surge | Root grow |
| win | Level/game complete | 8-bit victory | Synth fanfare | Forest choir |
| lose | Life lost | Sad trombone 8-bit | Error buzz | Thorn scratch |

---

## Folder Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── theme/
│   ├── ThemeContext.tsx
│   ├── themes.ts
│   ├── ThemeSwitcher.tsx
│   └── useTheme.ts
├── desktop/
│   ├── Desktop.tsx
│   ├── MenuBar.tsx
│   ├── GameCard.tsx
│   └── DesktopGrid.tsx
├── window/
│   ├── WindowManager.tsx
│   ├── WindowFrame.tsx
│   └── windowStore.ts
├── sound/
│   ├── SoundContext.tsx
│   ├── soundMap.ts
│   └── useSound.ts
├── games/
│   ├── registry.ts
│   ├── fiction/
│   │   ├── FictionGame.tsx
│   │   ├── FictionEngine.ts
│   │   ├── Inventory.tsx
│   │   └── content/ (retro.ts, futuristic.ts, organic.ts)
│   ├── geography/
│   │   ├── GeographyGame.tsx
│   │   ├── MapCanvas.tsx
│   │   ├── LocationPin.tsx
│   │   ├── InfoPopup.tsx
│   │   └── content/ (retro.ts, futuristic.ts, organic.ts)
│   ├── platformer/
│   │   ├── PlatformerGame.tsx
│   │   ├── engine.ts
│   │   ├── renderer.ts
│   │   ├── entities.ts
│   │   ├── levels.ts
│   │   └── content/ (retro.ts, futuristic.ts, organic.ts)
│   ├── builder/
│   │   ├── BuilderGame.tsx
│   │   ├── Grid.tsx
│   │   ├── Palette.tsx
│   │   ├── ScorePanel.tsx
│   │   └── content/ (retro.ts, futuristic.ts, organic.ts)
│   └── circuit/
│       ├── CircuitGame.tsx
│       ├── PuzzleGrid.tsx
│       ├── PathDrawer.tsx
│       └── content/ (retro.ts, futuristic.ts, organic.ts)
├── hooks/
│   ├── useDrag.ts
│   └── useGameLoop.ts
├── utils/
│   ├── cn.ts
│   └── clamp.ts
└── __tests__/
    ├── setup.ts                    # Vitest setup (jsdom, global mocks)
    ├── helpers/
    │   ├── renderWithProviders.tsx  # Wraps components in Theme+Sound providers
    │   └── mockAudio.ts            # AudioContext mock for sound tests
    ├── unit/
    │   ├── theme.test.ts           # Theme switching, CSS var application
    │   ├── windowStore.test.ts     # Zustand store operations
    │   ├── fictionEngine.test.ts   # Story state machine logic
    │   ├── platformerEngine.test.ts# Physics, collision, input
    │   ├── circuitValidation.test.ts# Path crossing, completion
    │   ├── builderScoring.test.ts  # Adjacency scoring calc
    │   └── geoScoring.test.ts      # Distance scoring calc
    ├── component/
    │   ├── MenuBar.test.tsx        # Clock, title display
    │   ├── GameCard.test.tsx       # Click opens window
    │   ├── WindowFrame.test.tsx    # Drag, resize, buttons
    │   ├── ThemeSwitcher.test.tsx  # Theme toggle
    │   ├── FictionGame.test.tsx    # Scene rendering, choices
    │   ├── CircuitGame.test.tsx    # Grid, path drawing
    │   ├── BuilderGame.test.tsx    # Palette, grid placement
    │   ├── GeographyGame.test.tsx  # Map click, pins
    │   └── PlatformerGame.test.tsx # Canvas mount, HUD
    ├── integration/
    │   ├── themeGameSwitch.test.tsx # Theme change mid-game resets
    │   ├── windowLifecycle.test.tsx # Open→play→minimize→restore→close
    │   └── fullGameFlow.test.tsx   # Open hub→pick game→play→complete
    ├── scenarios/
    │   ├── fiction.scenarios.test.ts   # Automated story playthroughs
    │   ├── circuit.scenarios.test.ts   # Automated puzzle solves
    │   ├── builder.scenarios.test.ts   # Automated build sessions
    │   ├── geo.scenarios.test.ts       # Automated geography rounds
    │   └── platformer.scenarios.test.ts# Automated level simulations
    └── e2e/
        ├── playwright.config.ts
        ├── hub.spec.ts             # Desktop loads, cards visible, clock works
        ├── themes.spec.ts          # Theme switch visually verified
        ├── windows.spec.ts         # Window drag/resize/stack in browser
        └── games.spec.ts           # Each game opens and is playable
```

---

## Step-by-Step Implementation Guide

### Step 0: Create Documentation Files
Create `docs/` directory with individual markdown files:
- `docs/hub.md` — Desktop shell design doc
- `docs/fiction.md` — Interactive fiction game doc
- `docs/geography.md` — Geography game doc
- `docs/platformer.md` — Platformer game doc
- `docs/builder.md` — Building sim game doc
- `docs/circuit.md` — Circuit puzzle game doc
- `docs/themes.md` — Theme engine doc

### Step 1: Project Scaffolding
1. `npm create vite@latest . -- --template react-ts`
2. Install deps: `npm i zustand clsx tailwind-merge`
3. Install Tailwind: `npm i -D tailwindcss @tailwindcss/vite` and configure
4. Install test deps: `npm i -D vitest @testing-library/react @testing-library/user-event jsdom playwright @playwright/test`
5. Set up `tsconfig.json` path aliases (`@/` → `src/`)
6. Configure `vite.config.ts` with path alias
7. Create `vitest.config.ts` with jsdom environment
8. Create `src/__tests__/setup.ts`, `helpers/renderWithProviders.tsx`, `helpers/mockAudio.ts`
9. Create `src/__tests__/logReporter.ts` — custom Vitest reporter that writes scenario results to `test-results/scenarios.log.json`
10. Create `src/utils/cn.ts` utility
11. Create `CHECKLIST.md` at project root
12. Add scripts to `package.json`: `test`, `test:coverage`, `test:scenarios`, `test:e2e`
13. Verify dev server runs + `npm test` runs (0 tests, no errors)

### Step 2: Theme Engine
1. Create `src/theme/themes.ts` with 3 theme definitions (all CSS var values)
2. Create `src/index.css` with CSS custom properties, Tailwind directives, overlay effect styles (scanlines, hologram, grain)
3. Create `src/theme/ThemeContext.tsx` — provider that sets CSS vars on `:root`
4. Create `src/theme/useTheme.ts` hook
5. Create `src/theme/ThemeSwitcher.tsx` — dropdown with 3 options
6. Write `__tests__/unit/theme.test.ts` + `__tests__/component/ThemeSwitcher.test.tsx`
7. **Verify**: All theme tests pass + toggle themes visually in dev server

### Step 3: Desktop Shell
1. Create `src/desktop/Desktop.tsx` — full-viewport container, theme background, overlay effects
2. Create `src/desktop/MenuBar.tsx` — clock (setInterval), active window title, ThemeSwitcher slot, volume icon
3. Create `src/games/registry.ts` — metadata for 5 games (id, title, description, icon emoji, component: lazy)
4. Create `src/desktop/GameCard.tsx` — card component with Play Now button
5. Create `src/desktop/DesktopGrid.tsx` — responsive grid of 5 cards
6. Wire `App.tsx` — ThemeProvider wraps Desktop
7. Write `__tests__/component/MenuBar.test.tsx` + `__tests__/component/GameCard.test.tsx`
8. **Verify**: All desktop tests pass + see desktop with 5 themed cards in dev server

### Step 4: Window Manager
1. Create `src/window/windowStore.ts` — Zustand store (open/close/minimize/maximize/focus/position/size)
2. Create `src/window/WindowFrame.tsx` — draggable window with title bar buttons, resize handle
3. Create `src/hooks/useDrag.ts` — generic pointer-event drag hook
4. Create `src/window/WindowManager.tsx` — renders WindowFrames for open windows
5. Wire GameCard "Play Now" → `windowStore.open(gameId)`
6. Wire MenuBar to show focused window title
7. Add bottom taskbar for minimized windows
8. Write `__tests__/unit/windowStore.test.ts` + `__tests__/component/WindowFrame.test.tsx` + `__tests__/integration/windowLifecycle.test.tsx`
9. **Verify**: All window tests pass + window interactions work in dev server

### Step 5: Sound System
1. Create/source placeholder sound files (18 sounds: 6 actions × 3 themes minimum)
2. Create `src/sound/soundMap.ts`
3. Create `src/sound/SoundContext.tsx` — lazy AudioContext, buffer cache
4. Create `src/sound/useSound.ts` hook
5. Wire sounds to window open/close/minimize events
6. Add volume control to MenuBar
7. **Verify**: Sounds play on window actions, change with theme

### Step 6: Game 1 — Interactive Fiction
1. Create `src/games/fiction/content/` types interface
2. Write `retro.ts` story (15-20 scenes, branching paths, 5 items)
3. Create `src/games/fiction/FictionEngine.ts` — state machine
4. Create `src/games/fiction/FictionGame.tsx` — scene renderer + choices
5. Create `src/games/fiction/Inventory.tsx` — item display sidebar
6. Write `futuristic.ts` and `organic.ts` story variants
7. Add theme-switch reset
8. Write `__tests__/unit/fictionEngine.test.ts` + `__tests__/component/FictionGame.test.tsx` + `__tests__/scenarios/fiction.scenarios.test.ts`
9. **Verify**: All fiction tests + scenarios pass, review scenario log output

### Step 7: Game 2 — Circuit Puzzle
1. Define puzzle level format types
2. Create `src/games/circuit/PuzzleGrid.tsx` — SVG grid renderer
3. Create `src/games/circuit/PathDrawer.tsx` — drag-to-draw with crossing validation
4. Write 5 levels per theme in `content/*.ts`
5. Create `src/games/circuit/CircuitGame.tsx` — level management, timer, completion
6. Style per theme (PCB traces / energy conduits / root tendrils)
7. Write `__tests__/unit/circuitValidation.test.ts` + `__tests__/component/CircuitGame.test.tsx` + `__tests__/scenarios/circuit.scenarios.test.ts`
8. **Verify**: All circuit tests + scenarios pass (including auto-solver), review log

### Step 8: Game 3 — Building/Simulation
1. Define item types and adjacency bonus format
2. Create `src/games/builder/Grid.tsx` — 12x12 CSS grid with click-to-place
3. Create `src/games/builder/Palette.tsx` — item selection sidebar
4. Create `src/games/builder/ScorePanel.tsx` — budget + score display
5. Create `src/games/builder/BuilderGame.tsx` — state orchestration with useReducer
6. Write content for all 3 themes (10 items each with adjacency rules)
7. Write `__tests__/unit/builderScoring.test.ts` + `__tests__/component/BuilderGame.test.tsx` + `__tests__/scenarios/builder.scenarios.test.ts`
8. **Verify**: All builder tests + scenarios pass, review log

### Step 9: Game 4 — Geography
1. Create/source SVG world map (Natural Earth) + custom star chart SVG
2. Create `src/games/geography/MapCanvas.tsx` — SVG renderer with click handling
3. Create `src/games/geography/LocationPin.tsx` — themed pin markers
4. Create `src/games/geography/InfoPopup.tsx` — landmark info cards
5. Create `src/games/geography/GeographyGame.tsx` — round management, scoring, reveal
6. Write 10-15 locations per theme with descriptions
7. Write `__tests__/unit/geoScoring.test.ts` + `__tests__/component/GeographyGame.test.tsx` + `__tests__/scenarios/geo.scenarios.test.ts`
8. **Verify**: All geo tests + scenarios pass, review log

### Step 10: Game 5 — Platformer
1. Create `src/hooks/useGameLoop.ts` — requestAnimationFrame loop
2. Create `src/games/platformer/engine.ts` — physics, collision, input
3. Create `src/games/platformer/entities.ts` — Player, Collectible, Hazard types
4. Create `src/games/platformer/renderer.ts` — canvas draw calls with theme colors
5. Create `src/games/platformer/levels.ts` — level parser
6. Write 3 levels per theme in `content/*.ts` (2D tile arrays)
7. Create `src/games/platformer/PlatformerGame.tsx` — canvas mount + React HUD overlay
8. Tune jump feel: gravity, jump force, move speed until responsive
9. Write `__tests__/unit/platformerEngine.test.ts` + `__tests__/component/PlatformerGame.test.tsx` + `__tests__/scenarios/platformer.scenarios.test.ts`
10. **Verify**: All platformer tests + scenarios pass, review log

### Step 11: Polish
1. Window open/close animations (scale + fade, 200ms)
2. Desktop background animations (scanline scroll / floating particles / leaf drift via CSS)
3. Game card hover effects per theme
4. Theme switch fade transition overlay
5. Welcome splash on first load
6. localStorage high scores for platformer, geography, circuit
7. Responsive clamping (min viewport 1024x768)
8. Write `__tests__/integration/themeGameSwitch.test.tsx` + `__tests__/integration/fullGameFlow.test.tsx`

### Step 12: Full Test Suite + E2E
1. Write E2E tests: `e2e/hub.spec.ts`, `e2e/themes.spec.ts`, `e2e/windows.spec.ts`, `e2e/games.spec.ts`
2. Run all unit tests — fix failures
3. Run all component tests — fix failures
4. Run all integration tests — fix failures
5. Run all scenario tests — review `test-results/scenarios.log.json`
6. Run E2E tests — fix visual/interaction issues
7. Generate coverage report — ensure >80% on core logic
8. Update `CHECKLIST.md` — mark all phases complete
9. **Verify**: `npm test` all green, `npx playwright test` all green, log file complete

---

## Verification Plan
1. **Theme engine**: Switch between all 3 themes — verify colors, fonts, borders, overlay effects, and sounds all change
2. **Window manager**: Open 3+ windows simultaneously — verify drag, resize, z-order, minimize/maximize/close all work
3. **Interactive fiction**: Play through each of the 3 story variants to completion — verify branching, inventory requirements, and win state
4. **Circuit puzzle**: Complete all 5 levels in each theme — verify path drawing, crossing detection, and completion validation
5. **Builder**: Place items in all themes — verify adjacency scoring calculates correctly, budget limits enforce
6. **Geography**: Complete a full 10-round game in each theme — verify pin placement, distance scoring, info popups
7. **Platformer**: Complete all 3 levels in each theme — verify physics feel right, collision detection works, scoring tallies
8. **Theme mid-game switch**: While in each game, switch theme — verify game resets cleanly and new content loads
9. **Sound**: Verify all 9 sound actions play correct themed sounds and volume control works

---

## Testing System

### Testing Stack
- **Vitest** — Unit and component tests (fast, Vite-native)
- **@testing-library/react** — Component rendering and interaction
- **jsdom** — Browser DOM simulation for tests
- **Playwright** — E2E browser tests for visual/interaction verification

### Test Setup (`src/__tests__/setup.ts`)
- Configure jsdom environment
- Mock `AudioContext` and `Audio` globally (sounds don't play in tests, but calls are tracked)
- Mock `requestAnimationFrame` for platformer engine tests
- Provide `renderWithProviders()` helper that wraps any component in `ThemeProvider` + `SoundProvider`

### Unit Tests (Pure Logic — No DOM)

**`theme.test.ts`**
- Theme definitions have all required CSS vars
- Switching theme produces correct var set
- All 3 themes have matching keys (no missing vars)

**`windowStore.test.ts`**
- `open()` creates window with correct defaults
- `open()` same game twice focuses existing instead of duplicating
- `close()` removes window from array
- `minimize()` / `maximize()` toggle flags
- `focus()` increments z-index
- `updatePosition()` / `updateSize()` clamp to bounds

**`fictionEngine.test.ts`**
- Starting state has correct initial scene
- `makeChoice()` transitions to correct next scene
- Choice with `requiredItem` is unavailable without item
- Choice with `requiredItem` works when item is in inventory
- `itemGained` adds to inventory
- All scenes in each theme variant are reachable (graph traversal)
- At least one path reaches win state per variant
- No dead-end scenes without choices (except win/lose)

**`platformerEngine.test.ts`**
- Gravity accelerates downward velocity each frame
- Jump sets upward velocity when on ground
- Jump does nothing when airborne
- Horizontal movement matches input direction
- Collision with ground tile stops downward movement and sets `onGround`
- Collision with wall tile stops horizontal movement
- Collectible overlap increments score and removes collectible
- Hazard overlap decrements lives
- Goal tile overlap triggers level complete
- Level data parses into correct entity positions

**`circuitValidation.test.ts`**
- Valid path between matching nodes is accepted
- Path crossing another path is rejected
- Path through a non-matching node is rejected
- Incomplete path (doesn't reach target) is not counted
- All pairs connected = level complete
- Clearing a path frees cells for reuse
- Each puzzle level in each theme is solvable (automated solver)

**`builderScoring.test.ts`**
- Empty grid = 0 score
- Single item = base score only
- Adjacent matching bonus items = correct bonus
- Non-adjacent items = no bonus
- Placing item deducts from budget
- Removing item refunds cost
- Budget prevents placement when insufficient
- All adjacency rules in each theme are internally consistent

**`geoScoring.test.ts`**
- Exact match = 100 points
- Within 3% radius = 100 points
- Within 10% = 50 points
- Within 20% = 25 points
- Beyond 20% = 0 points
- Total score sums correctly across rounds
- All locations in each theme have valid coordinates (0-1 range)

### Component Tests (DOM Rendering + Interaction)

**`MenuBar.test.tsx`**
- Renders current time (mocked Date)
- Shows "Desktop" when no window focused
- Shows window title when a window is focused
- ThemeSwitcher is present and functional

**`GameCard.test.tsx`**
- Renders title, description, Play Now button
- Click Play Now calls `windowStore.open` with correct gameId
- Card applies theme-specific CSS classes

**`WindowFrame.test.tsx`**
- Renders title bar with game title
- Close button calls `windowStore.close`
- Minimize button calls `windowStore.minimize`
- Maximize button calls `windowStore.maximize`
- Renders children (game component) in body

**`ThemeSwitcher.test.tsx`**
- Shows all 3 theme options
- Clicking a theme calls `setTheme` with correct id
- Active theme is visually indicated

**`FictionGame.test.tsx`**
- Renders scene text for current scene
- Renders choice buttons
- Clicking a choice transitions to next scene
- Inventory items display in sidebar
- Theme change resets game state

**`CircuitGame.test.tsx`**
- Renders grid with correct dimensions for current level
- Source and target nodes are visible
- Level indicator and timer display
- Completion message on all paths connected

**`BuilderGame.test.tsx`**
- Renders 12x12 grid
- Palette shows all items for current theme
- Clicking palette selects item
- Clicking grid cell places selected item
- Score panel shows budget and score
- Theme change resets grid

**`GeographyGame.test.tsx`**
- Renders map SVG
- Shows location prompt text
- Click on map places a pin
- After guess, shows correct location and score
- Round counter advances
- End screen shows total score

**`PlatformerGame.test.tsx`**
- Canvas element mounts
- HUD overlay shows score, lives, level
- Theme change resets level

### Integration Tests

**`themeGameSwitch.test.tsx`**
- Open fiction game in retro → verify retro story text
- Switch to futuristic → verify game resets, shows futuristic story text
- Switch to organic → verify game resets, shows organic story text
- Repeat for each game type

**`windowLifecycle.test.tsx`**
- Open game → window appears in DOM
- Minimize → window hidden, taskbar button appears
- Click taskbar button → window restored
- Maximize → window fills viewport
- Close → window removed from DOM
- Open 3 games → all render, clicking one brings it to front

**`fullGameFlow.test.tsx`**
- Hub loads with 5 cards
- Click Play on fiction → window opens, story renders
- Make choices through to win state → win message displays
- Close game → back to desktop
- Click Play on circuit → window opens, grid renders
- Complete level 1 → advances to level 2

### Automated Game Scenario Tests (`scenarios/`)

These simulate full game playthroughs programmatically and log results.

**`fiction.scenarios.test.ts`**
For each theme variant:
- **Optimal path test**: Follow the shortest path to win. Assert win state reached in minimum choices
- **Exploration test**: Visit every reachable scene. Assert no crashes, all text renders
- **Dead end test**: Follow each dead-end branch. Assert retry/restart is available
- **Inventory gate test**: Attempt gated choice without item (blocked), then with item (succeeds)
- Log: scene count visited, items collected, total choices made, outcome

**`circuit.scenarios.test.ts`**
For each theme × each level (15 total):
- **Auto-solve test**: BFS/DFS solver finds a valid solution. Assert it passes validation
- **Invalid path test**: Attempt crossing paths. Assert rejection
- **Clear and retry test**: Solve partially, clear, re-solve differently. Assert clean state
- Log: level, grid size, pairs count, solve time (ms), solution path lengths

**`builder.scenarios.test.ts`**
For each theme:
- **Max score test**: Place all items optimally for highest adjacency bonuses. Assert score matches expected
- **Budget exhaustion test**: Place items until budget = 0. Assert placement blocked
- **Remove and replace test**: Place, remove, re-place. Assert budget and score correct
- **Random placement test**: Place 20 random items. Assert no crashes, score >= 0
- Log: items placed, final score, budget remaining, adjacency bonuses triggered

**`geo.scenarios.test.ts`**
For each theme:
- **Perfect game test**: Click exact coordinates for all locations. Assert 100pts × rounds
- **Worst game test**: Click corner (0,0) for all. Assert 0pts each
- **Mixed accuracy test**: Alternate between perfect and far guesses. Assert correct per-round scores
- **All locations test**: Verify all locations have descriptions and valid coordinates
- Log: per-round scores, total score, rating earned

**`platformer.scenarios.test.ts`**
For each theme × each level (9 total):
- **Collision test**: Place player at each hazard tile. Assert life lost
- **Collectible test**: Move player through each collectible tile. Assert score increments
- **Goal test**: Move player to goal tile. Assert level complete triggered
- **Gravity test**: Player falls when no ground below. Assert downward movement
- **Level bounds test**: Player cannot move outside level boundaries
- Log: level, entities counted, collectibles collected, hazards hit, completion status

### Test Log System

All scenario tests write to a structured JSON log file at `test-results/scenarios.log.json`:

```typescript
interface TestLog {
  timestamp: string;
  duration_ms: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  games: {
    fiction: GameTestResult;
    circuit: GameTestResult;
    builder: GameTestResult;
    geography: GameTestResult;
    platformer: GameTestResult;
  };
}

interface GameTestResult {
  scenarios_run: number;
  scenarios_passed: number;
  themes_tested: string[];
  details: ScenarioDetail[];
}

interface ScenarioDetail {
  name: string;
  theme: string;
  status: 'pass' | 'fail';
  duration_ms: number;
  log: Record<string, any>; // game-specific metrics
  error?: string;
}
```

A custom Vitest reporter (`src/__tests__/logReporter.ts`) collects results and writes this file after each test run.

### E2E Tests (Playwright)

**`hub.spec.ts`**
- Page loads without errors
- 5 game cards visible with correct titles
- Clock displays and updates
- Theme switcher is accessible

**`themes.spec.ts`**
- Switch to each theme → screenshot comparison (visual regression)
- CSS variables on `:root` match theme definition
- Fonts load and apply correctly
- Overlay effects render (scanlines visible in retro, etc.)

**`windows.spec.ts`**
- Click Play Now → window opens with animation
- Drag window by title bar → position updates
- Resize window from corner → dimensions update
- Click close → window removes with animation
- Open 3 windows → correct z-stacking on focus

**`games.spec.ts`**
- Fiction: Open, see story text, click a choice, scene changes
- Circuit: Open, see grid, attempt to draw a path
- Builder: Open, see grid + palette, place an item
- Geography: Open, see map, click to place pin
- Platformer: Open, see canvas rendering frames

### Test Commands

```bash
# Run all unit + component + integration tests
npm test

# Run with coverage
npm test -- --coverage

# Run scenario tests only (writes to test-results/scenarios.log.json)
npm test -- --reporter=default --reporter=./src/__tests__/logReporter.ts scenarios

# Run E2E tests
npx playwright test

# Run E2E with headed browser (visual)
npx playwright test --headed
```

### Implementation Steps for Testing

**Added to Step 1 (Scaffolding)**:
- Install: `npm i -D vitest @testing-library/react @testing-library/user-event jsdom`
- Install: `npm i -D playwright @playwright/test`
- Add `test` script to `package.json`
- Create `vitest.config.ts` with jsdom environment
- Create `src/__tests__/setup.ts` with mocks
- Create `src/__tests__/helpers/renderWithProviders.tsx`
- Create `src/__tests__/helpers/mockAudio.ts`

**Added after each Step (2-10)**: Write corresponding tests immediately after building each feature. Tests are listed above by category — unit tests for the logic, component tests for the UI, scenario tests for game-specific playthroughs.

**Step 12 (new): Full Test Suite Run**
1. Run all unit tests — fix any failures
2. Run all component tests — fix any failures
3. Run all integration tests — fix any failures
4. Run all scenario tests — review log output
5. Run E2E tests — fix any visual/interaction issues
6. Generate coverage report — ensure >80% on core logic files
7. Commit final `test-results/scenarios.log.json` as baseline

---

## Progress Checklist

A `CHECKLIST.md` file at the project root tracks all work. Updated as each task starts and completes.

```markdown
# Game Hub — Progress Checklist

## Legend
- [ ] Not started
- [~] In progress
- [x] Completed

## Phase 1: Foundation
- [ ] Project scaffolding (Vite + React + TS + Tailwind)
- [ ] Testing setup (Vitest + Testing Library + Playwright)
- [ ] Documentation files created (docs/*.md)

## Phase 2: Theme Engine
- [ ] Theme definitions (themes.ts — 3 themes, all CSS vars)
- [ ] CSS custom properties + Tailwind integration
- [ ] ThemeContext provider
- [ ] ThemeSwitcher component
- [ ] Overlay effects (scanlines, hologram, grain)
- [ ] Theme unit tests passing

## Phase 3: Desktop Shell
- [ ] Desktop.tsx (full viewport, theme backgrounds)
- [ ] MenuBar.tsx (clock, title, theme switcher, volume)
- [ ] GameCard.tsx (themed cards with Play Now)
- [ ] DesktopGrid.tsx (5-card layout)
- [ ] Game registry (registry.ts)
- [ ] Desktop component tests passing

## Phase 4: Window Manager
- [ ] windowStore.ts (Zustand — open/close/min/max/focus/drag/resize)
- [ ] WindowFrame.tsx (draggable, resizable, title bar buttons)
- [ ] WindowManager.tsx (renders open windows)
- [ ] useDrag.ts hook
- [ ] Bottom taskbar for minimized windows
- [ ] Window store unit tests passing
- [ ] Window component tests passing
- [ ] Window integration tests passing

## Phase 5: Sound System
- [ ] Sound files created/sourced (3 themes × 9 actions)
- [ ] SoundContext.tsx + soundMap.ts
- [ ] useSound.ts hook
- [ ] Volume control in MenuBar
- [ ] Sound wired to window events

## Phase 6: Game 1 — Interactive Fiction
- [ ] Content types defined
- [ ] Retro story content (15-20 scenes)
- [ ] Futuristic story content (15-20 scenes)
- [ ] Organic story content (15-20 scenes)
- [ ] FictionEngine.ts (state machine)
- [ ] FictionGame.tsx (renderer + choices)
- [ ] Inventory.tsx component
- [ ] Theme-switch reset behavior
- [ ] Fiction engine unit tests passing
- [ ] Fiction component tests passing
- [ ] Fiction scenario tests passing (all 3 variants)

## Phase 7: Game 2 — Circuit Puzzle
- [ ] Puzzle level format types
- [ ] PuzzleGrid.tsx (SVG renderer)
- [ ] PathDrawer.tsx (drag-to-draw + crossing validation)
- [ ] Retro puzzle content (5 levels)
- [ ] Futuristic puzzle content (5 levels)
- [ ] Organic puzzle content (5 levels)
- [ ] CircuitGame.tsx (level management, timer)
- [ ] Themed styling (PCB / conduits / roots)
- [ ] Circuit validation unit tests passing
- [ ] Circuit component tests passing
- [ ] Circuit scenario tests passing (auto-solver)

## Phase 8: Game 3 — Building/Simulation
- [ ] Item types + adjacency bonus format
- [ ] Grid.tsx (12x12 CSS grid)
- [ ] Palette.tsx (item selection sidebar)
- [ ] ScorePanel.tsx (budget + score)
- [ ] BuilderGame.tsx (state orchestration)
- [ ] Retro content (10 items + rules)
- [ ] Futuristic content (10 items + rules)
- [ ] Organic content (10 items + rules)
- [ ] Builder scoring unit tests passing
- [ ] Builder component tests passing
- [ ] Builder scenario tests passing

## Phase 9: Game 4 — Geography
- [ ] SVG world map sourced/created
- [ ] Custom star chart SVG created
- [ ] MapCanvas.tsx (SVG + click handling)
- [ ] LocationPin.tsx (themed markers)
- [ ] InfoPopup.tsx (landmark info cards)
- [ ] GeographyGame.tsx (rounds, scoring, reveal)
- [ ] Retro locations (10-15)
- [ ] Futuristic locations (10-15)
- [ ] Organic locations (10-15)
- [ ] Geo scoring unit tests passing
- [ ] Geo component tests passing
- [ ] Geo scenario tests passing

## Phase 10: Game 5 — Platformer
- [ ] useGameLoop.ts hook
- [ ] engine.ts (physics, collision, input)
- [ ] entities.ts (Player, Collectible, Hazard)
- [ ] renderer.ts (canvas draw)
- [ ] levels.ts (level parser)
- [ ] Retro levels (3 levels)
- [ ] Futuristic levels (3 levels)
- [ ] Organic levels (3 levels)
- [ ] PlatformerGame.tsx (canvas + HUD)
- [ ] Tuned jump feel
- [ ] Platformer engine unit tests passing
- [ ] Platformer component tests passing
- [ ] Platformer scenario tests passing

## Phase 11: Polish
- [ ] Window open/close animations
- [ ] Desktop background animations per theme
- [ ] Game card hover effects per theme
- [ ] Theme switch transition overlay
- [ ] Welcome splash screen
- [ ] localStorage high scores
- [ ] Responsive clamping (min 1024x768)

## Phase 12: Full Test Suite
- [ ] All unit tests passing
- [ ] All component tests passing
- [ ] All integration tests passing
- [ ] All scenario tests passing + log reviewed
- [ ] E2E tests passing
- [ ] Coverage >80% on core logic
- [ ] scenarios.log.json committed as baseline

## Phase 13: Final Review
- [ ] All 15 theme × game combinations manually verified
- [ ] Theme mid-game switch works for all games
- [ ] Sound plays correctly across all themes
- [ ] No console errors in any state
- [ ] Build succeeds (npm run build)
- [ ] Production build tested locally
```

This checklist file is created at Step 0 and updated throughout implementation. Each task is marked `[~]` when work begins and `[x]` when complete with tests passing.
