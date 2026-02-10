# Desktop Shell (Game Hub)

## Overview

Full-viewport simulated desktop OS environment that hosts 5 mini games. The shell provides window management, a menu bar, and themed game cards.

## Components

### Desktop.tsx
- Full-viewport simulated OS container
- Theme-aware background:
  - **Retro**: Dark static noise
  - **Futuristic**: Gradient mesh animation
  - **Organic**: Paper texture
- Renders MenuBar at top, DesktopGrid centered, WindowManager overlaid

### MenuBar.tsx
- Top bar always visible above all windows
- **Live clock**: HH:MM:SS + date, updated via `setInterval`
- **Focused window title**: Shows title of focused window, or "Desktop" when none focused
- **ThemeSwitcher**: Dropdown with 3 theme options
- **Volume control**: Icon to toggle/adjust sound volume

### DesktopGrid.tsx
- Responsive centered grid of 5 GameCards
- Visible behind any open windows

### GameCard.tsx
- Displays game icon (emoji), title, 1-line description, and "Play Now" button
- Themed styling per active theme:
  - **Retro**: Pixel borders, neon text
  - **Futuristic**: Glass panel with glow
  - **Organic**: Leaf-bordered, handwritten font
- "Play Now" calls `windowStore.open(gameId)`

## Game Registry (registry.ts)
- Metadata array for all 5 games
- Each entry: `{ id, title, description, icon, component: React.lazy(() => import(...)) }`
- Games:
  1. Interactive Fiction — "Explore branching stories"
  2. Geography — "Pin & Discover landmarks"
  3. Platformer — "Run, jump, collect"
  4. Building Sim — "Build your world"
  5. Circuit Puzzle — "Connect the nodes"

## Window Manager

### windowStore.ts (Zustand)
- State: Array of `WindowState` objects
- `WindowState`: `{ id, gameId, title, x, y, width, height, minimized, maximized, zIndex }`
- Actions: `open`, `close`, `minimize`, `maximize`, `focus`, `updatePosition`, `updateSize`
- Opening a game that's already open focuses + restores it (no duplicates)

### WindowManager.tsx
- Renders a `WindowFrame` for each open window, layered over the desktop
- Z-ordering via `zIndex` on each window

### WindowFrame.tsx
- Draggable via title bar (pointer events)
- Resizable via corner handle
- Title bar buttons: minimize, maximize, close
- Min size: 400x300, max size: viewport dimensions
- **Minimize**: Hides window, shows button in bottom taskbar. Click taskbar button to restore
- **Maximize**: Fills desktop area below MenuBar. Toggle to restore previous size/position

### useDrag.ts Hook
- Generic pointer-event drag hook used by WindowFrame for drag and resize operations

## Behavior
- Desktop loads with 5 game cards visible
- Clicking "Play Now" opens a window with the game inside
- Multiple windows can be open simultaneously
- Clicking a window brings it to front (z-index)
- Taskbar at bottom shows minimized windows
