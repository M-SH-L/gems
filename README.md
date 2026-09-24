# Gems 🎮

**A simulated desktop OS environment hosting 5 theme-switchable mini games — plus a portal to Gems V2, a 3D world with 3 more.**

By Mishaal • Personal playground for exploring game mechanics, UI systems, and React patterns.

---

## What is this?

Gems is an experimental web-based desktop environment where I'm exploring:

- **Window Management** – Draggable, resizable, minimizable windows with focus handling and z-ordering
- **Theme Engine** – Three distinct visual themes (Retro, Futuristic, Organic) that transform the entire experience
- **Game Design** – Five different game genres, each with theme-specific content variants
- **State Management** – Zustand for windows, React Context for themes, game-specific state patterns
- **Testing Strategies** – Comprehensive test suite including unit, component, integration, scenario, and E2E tests

This is a playground, not a product. It's where I experiment with ideas, test technical approaches, and build things for the joy of building.

---

## Gems V2 — step through the portal 🌀

The app still opens on the V1 desktop. Click the swirling **ENTER V2** orb in the
bottom-right corner and the desktop gets pulled into a vortex that drops you into
**Gems V2**: a three.js world with a 3D hub and three new games. **Back to V1**
(or Esc in the hub) runs the portal in reverse. You can also link straight to `/#v2`.

| Game | Genre | Controls |
|------|-------|----------|
| 💎 **Gem Rush** | Endless runner on a synthwave causeway | ← → lanes, Space jump (tap on touch) |
| 🏗️ **Sky Stack** | Timing stacker into the clouds | Space / click to drop |
| 🟢 **Tilt Maze** | Physics marble maze, 5 levels | Arrows / WASD / drag to tilt |

V2 has no theme switching. Details and architecture: [`docs/v2.md`](docs/v2.md).

---

## The Desktop Shell (Game Hub)

A simulated operating system with:

- **MenuBar** – Live clock, active window title, theme switcher, volume control
- **Desktop Grid** – 5 game cards with themed styling
- **Window Manager** – Full window lifecycle (open, drag, resize, minimize, maximize, close, focus)
- **Taskbar** – Shows minimized windows for quick restoration
- **Theme-Aware Backgrounds** – Dynamic overlays (CRT scanlines for Retro, holographic shimmer for Futuristic, paper grain for Organic)

---

## The Games

### 📖 Interactive Fiction
**Text-based branching narratives with inventory systems**

- **Retro:** "Dungeon of the Pixel King" – Classic dungeon crawl to find the lost crown (15-20 scenes)
- **Futuristic:** "Station Zero" – Investigate an abandoned space station as a maintenance AI
- **Organic:** "Whispers of the Grove" – Heal a corrupted Great Tree as a seedling spirit

Each variant features unique stories with 2-3 branching paths, inventory-gated choices, and multiple endings.

### 🔌 Circuit Puzzle
**Path-drawing logic puzzles**

- **Retro:** "Chip Fix" – Connect IC chips on a green PCB board with copper traces
- **Futuristic:** "Power Grid" – Route glowing energy conduits between power cores
- **Organic:** "Root Network" – Grow root tendrils to connect seed pods underground

5 levels per theme with increasing complexity. Paths cannot cross. Some levels require filling every grid cell.

### 🏗️ Building Sim
**Grid-based world building with adjacency scoring**

- **Retro:** "Pixel Town" – Build a village with houses, shops, parks, and roads (12×12 grid)
- **Futuristic:** "Station Architect" – Design a space station with modules, corridors, and systems
- **Organic:** "Garden of Life" – Create a garden ecosystem with plants, water, and wildlife areas

Place items strategically for adjacency bonuses. Budget system limits placement. Aim for high scores.

### 🌍 Geography
**Location guessing meets landmark exploration**

- **Retro:** "Arcade Atlas" – Find gaming landmarks (Tokyo Game District, Atari HQ, Nintendo HQ)
- **Futuristic:** "Star Navigator" – Locate star systems and space stations on a custom star chart
- **Organic:** "Wild Atlas" – Discover natural wonders (Great Barrier Reef, Amazon Rainforest, Serengeti)

10 rounds per game. Click the map to guess. Scored on accuracy. Learn about each landmark after guessing.

### 🏃 Platformer
**Classic side-scrolling action**

- **Retro:** "Block Dash" – 8-bit pixel blocks, gold coins, spikes, and bouncing enemies
- **Futuristic:** "Neon Surge" – Glowing platforms, energy orbs, laser beams, and drones
- **Organic:** "Leaf Leap" – Forest floors, dewdrops, thorns, and mushroom platforms

3 levels per theme. Run, jump, collect, avoid hazards. Canvas-based 60fps physics engine.

---

## The Theme Engine

Three complete visual and content themes:

### 🕹️ Retro
- **Visuals:** Neon green (`#39ff14`) on black, Press Start 2P font, sharp pixels, CRT scanlines
- **Content:** 8-bit aesthetics, dungeon crawls, PCB circuits, pixel villages, arcade geography
- **Sounds:** 8-bit beeps, chiptune rises, coin dings, circuit buzzes

### 🚀 Futuristic
- **Visuals:** Cyan (`#00e5ff`) and magenta, Orbitron font, rounded glass panels, holographic shimmer
- **Content:** Space stations, energy grids, sci-fi narratives, star charts
- **Sounds:** Synth tones, whooshes, energy pulses, power surges

### 🌿 Organic
- **Visuals:** Earth greens (`#2d6a4f`) and ambers, Caveat handwritten font, dashed borders, paper grain
- **Content:** Forest spirits, root networks, garden ecosystems, natural wonders
- **Sounds:** Nature clicks, rustles, dewdrops, forest choirs

**Theme switching mid-game resets the game** with new content to avoid impossible state transitions.

---

## Tech Stack

**Core:**
- React 19 + TypeScript
- Vite for dev/build
- Tailwind CSS 4 (CSS custom properties for theming)
- Zustand for window state (~2KB)

**Utilities:**
- clsx + tailwind-merge for class utilities (~6KB)

**No external libraries for (V1):**
- Maps (plain SVG)
- Game engines (custom canvas rendering)
- Animations (CSS only)

**V2:**
- three.js for the 3D hub and games, lazy-loaded only when you enter the portal

**Testing:**
- Vitest for unit/component/integration tests
- @testing-library/react for component tests
- jsdom for DOM simulation
- Playwright for E2E browser tests

**Total runtime JS beyond React:** ~8KB

---

## Testing Philosophy

Comprehensive test coverage across multiple layers:

- **Unit Tests** – Pure logic (theme engine, window store, game engines, scoring, validation)
- **Component Tests** – DOM rendering and user interactions
- **Integration Tests** – Theme switching mid-game, window lifecycles, full game flows
- **Scenario Tests** – Automated game playthroughs (optimal paths, edge cases, auto-solvers)
- **E2E Tests** – Visual regression, drag/resize/stack behaviors, actual gameplay in browser

Test results logged to `test-results/scenarios.log.json` for review.

---

## Project Structure

```
src/
├── theme/          # Theme engine (CSS vars, context, switcher)
├── desktop/        # Desktop shell (menu bar, game cards, grid)
├── shell/          # Window manager (frames, store, useDrag)
├── sound/          # Sound system (context, map, hook)
├── games/
│   ├── fiction/    # Interactive fiction engine + 3 story variants
│   ├── circuit/    # Circuit puzzle grid + 15 levels (5 per theme)
│   ├── builder/    # Building sim grid + 3 content sets
│   ├── geography/  # Map-based guessing + 3 location sets
│   └── platformer/ # Canvas platformer + 9 levels (3 per theme)
├── portal/         # V1 ↔ V2 portal orb + vortex transition
├── v2/             # Gems V2: three.js stage, 3D hub, runner / stacker / maze
├── hooks/          # Custom hooks (useGameLoop, useThemeReset)
├── utils/          # Utilities (cn, clamp)
└── __tests__/      # Full test suite (unit, component, integration, scenarios, e2e)
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run scenario tests (logs to test-results/)
npm run test:scenarios

# Run E2E tests
npm run test:e2e
```

---

## Project Status

This is an active experiment in various stages of completion:

✅ **Completed:**
- Desktop shell scaffolding
- Window manager with full drag/resize/focus
- Theme engine with 3 themes
- Test infrastructure

🚧 **In Progress:**
- Game implementations (content variants, mechanics)
- Sound system
- Polish and animations

📋 **Planned:**
- All 5 games fully playable across all 3 themes
- Full scenario test coverage
- localStorage high scores
- Welcome splash screen

See `docs/PLAN.md` for the complete implementation plan and `CHECKLIST.md` for detailed progress.

---

**Gems** – Where desktop environments meet game design experiments.
