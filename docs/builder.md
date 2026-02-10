# Game 4: Building/Simulation — "World Builder"

## Concept

A 2D top-down grid-based builder. Drag items from a palette onto a grid to create a themed environment. Simple resource budget and adjacency-based scoring.

## Theme Variants

### Retro — "Pixel Town"
- **Building**: A small pixel village with houses, shops, roads, parks
- **Palette items** (10): House, Shop, Road, Park, Well, Tavern, Wall, Farm, Tower, Bridge
- **Grid**: 12x12, green pixel grass background
- **Scoring**: Happiness score
  - Houses near parks: +bonus
  - Shops near roads: +bonus
  - Tavern near houses: +bonus

### Futuristic — "Station Architect"
- **Building**: A space station with modules, corridors, and systems
- **Palette items** (10): Crew Quarters, Lab, Corridor, Airlock, Power Core, Medbay, Storage, Comms Array, Reactor, Garden Dome
- **Grid**: 12x12, dark space background with star dots
- **Scoring**: Efficiency score
  - Quarters near medbay: +bonus
  - Lab near power core: +bonus
  - All modules connected via corridors: required

### Organic — "Garden of Life"
- **Building**: A garden ecosystem with plants, water, and wildlife areas
- **Palette items** (10): Flower Bed, Tree, Pond, Path, Bench, Beehive, Herb Garden, Bird Bath, Trellis, Compost
- **Grid**: 12x12, earthy brown soil background
- **Scoring**: Biodiversity score
  - Trees near ponds: +bonus
  - Beehives near flower beds: +bonus
  - Paths connecting areas: +bonus

## Mechanics

### Grid
- 12x12 cells
- Each cell holds 0 or 1 item
- Items are 1x1 size

### Palette
- Scrollable sidebar with all available items
- Each item shows: name, icon (colored square/symbol), cost

### Budget
- Start with 100 credits
- Each item costs 5-15 credits
- Removing items refunds the full cost

### Placement
- Click palette item to select it
- Click grid cell to place selected item
- Or drag from palette directly onto grid

### Removal
- Right-click a cell to remove its item
- Or select eraser tool, then click cell

### Adjacency Scoring
- After each placement, score is recalculated
- Each item type has adjacency bonuses defined in content config
- Bonuses apply when specific item types are in neighboring cells (up/down/left/right)

### Completion
- No explicit "end" — player builds until satisfied or runs out of budget
- Running score displayed continuously
- "Best Score" tracked via localStorage

### Visual Style
- Items rendered as themed colored tiles
- Simple emoji or symbol overlays on each tile

## Technical Implementation

### Files
- `Grid.tsx` — CSS grid of div cells (12x12). Each cell styled based on content. Click/drop handlers
- `Palette.tsx` — Sidebar list of items, click to select or drag
- `ScorePanel.tsx` — Shows budget remaining, current score, adjacency breakdown
- `BuilderGame.tsx` — Orchestrates state: `{ grid, selectedItem, budget, score }`
- `content/retro.ts`, `content/futuristic.ts`, `content/organic.ts` — Export `BuilderContent` with item definitions, adjacency rules, grid background style

### State Management
- `useReducer` with actions: `PLACE_ITEM`, `REMOVE_ITEM`, `SELECT_ITEM`

### Score Calculation
- Pure function iterating grid
- For each cell with an item, check all 4 neighbors
- Look up neighbor pair in adjacency bonus map
- Sum all bonuses for total score

### Data Structures
```typescript
interface BuilderItem {
  id: string;
  name: string;
  icon: string;  // emoji or symbol
  cost: number;
  color: string;
}

interface AdjacencyRule {
  item: string;    // item id
  neighbor: string; // neighboring item id
  bonus: number;
}

interface BuilderContent {
  items: BuilderItem[];
  adjacencyRules: AdjacencyRule[];
  gridBackground: string;
}
```
