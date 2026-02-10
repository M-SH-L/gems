# Game 5: Circuit Puzzle — "Connect"

## Concept

A grid-based path-drawing puzzle. Connect source nodes to matching target nodes by drawing paths along grid edges. Paths cannot cross. Increasing complexity across 5 levels per theme.

## Theme Variants

### Retro — "Chip Fix"
- **Visual**: Green PCB board with copper traces, component nodes as IC chips
- **Nodes**: Red/blue/yellow/green square chips with pin markings
- **Paths**: Copper-colored traces with solder points at turns
- **Background**: Dark green PCB texture with drill holes pattern

### Futuristic — "Power Grid"
- **Visual**: Dark grid with glowing energy conduits
- **Nodes**: Cyan/magenta/gold/lime glowing power cores
- **Paths**: Animated glowing lines with energy pulse traveling along them
- **Background**: Dark metallic surface with subtle hex grid

### Organic — "Root Network"
- **Visual**: Underground cross-section with soil layers
- **Nodes**: Colored seed pods (red berry/blue mushroom/yellow flower/green sprout)
- **Paths**: Brown root tendrils that grow along the path
- **Background**: Earthy soil gradient with small rock and worm details

## Mechanics

### Grid Sizes
| Level | Grid |
|-------|------|
| L1 | 5x5 |
| L2 | 6x6 |
| L3 | 7x7 |
| L4 | 8x8 |
| L5 | 9x9 |

### Nodes
- Each level has 2-5 pairs of colored source/target nodes placed on grid cells
- Source and target of each pair share the same color

### Path Drawing
- Click a source node to begin drawing
- Click/drag through adjacent empty cells to extend the path
- Paths follow grid lines: horizontal/vertical only, no diagonals
- Reach the matching target node to complete the connection

### Rules
- Paths cannot cross each other
- Paths cannot pass through nodes that aren't the matching target
- Levels L4-L5: every cell must be filled (flow-puzzle style)

### Validation
- Level is complete when all pairs are connected with valid non-crossing paths

### Undo
- Click on an existing path to clear it and redraw

### Hints
- Optional: highlight one correct path segment
- Limited to 3 hints per game

### Timer
- Time tracked but not enforced
- Shown as a subtle counter
- Best times saved to localStorage

## Technical Implementation

### Files
- `PuzzleGrid.tsx` — SVG-based grid. Cells as `<rect>`, nodes as styled `<circle>`/`<rect>`, paths as `<line>` segments
- `PathDrawer.tsx` — Handles pointer events: mousedown on source starts path, mousemove through adjacent cells extends path, mouseup on matching target completes path. Validates no-crossing on each extension
- `CircuitGame.tsx` — Manages state: `{ grid, paths, activeColor, level, timer }`
- `content/retro.ts`, `content/futuristic.ts`, `content/organic.ts` — Export `PuzzleContent` with level definitions

### State Management
- `useReducer` with actions: `START_PATH`, `EXTEND_PATH`, `COMPLETE_PATH`, `CLEAR_PATH`, `NEXT_LEVEL`

### Crossing Detection
- Maintain a `Set<"r,c">` of occupied cells
- Before extending a path, check if target cell is occupied by another color's path
- If occupied, block the extension

### Level Data Structure
```typescript
interface PuzzleLevel {
  gridSize: number;
  nodes: {
    color: string;
    source: [number, number]; // [row, col]
    target: [number, number];
  }[];
  blockedCells?: [number, number][];
}
```
