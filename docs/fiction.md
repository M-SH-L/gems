# Game 1: Interactive Fiction

## Concept

A text-based adventure with branching narrative, inventory system, and 15-20 scenes per theme variant. Player reads scene descriptions and picks from 2-4 choices. Some paths require specific inventory items.

## Theme Variants

### Retro — "Dungeon of the Pixel King"
- **Setting**: Classic dungeon crawl beneath a pixelated castle
- **Story**: Explore a glitching dungeon to find the Pixel King's lost crown. Navigate trap rooms, solve riddles from 8-bit NPCs, collect keys and potions
- **Inventory items**: Rusty Key, Health Potion, Torch, Magic Scroll, Pixel Sword
- **Win condition**: Reach the throne room with the crown
- **UI style**: Terminal/console text display

### Futuristic — "Station Zero"
- **Setting**: Abandoned space station orbiting a dying star
- **Story**: You're a maintenance AI that wakes up to find the crew missing. Investigate labs, crew quarters, and the bridge to uncover what happened. Piece together logs, override locked doors, reroute power
- **Inventory items**: Access Card, Power Cell, Data Chip, Plasma Cutter, Emergency Beacon
- **Win condition**: Discover the truth and activate the emergency beacon
- **UI style**: Holographic panel display

### Organic — "Whispers of the Grove"
- **Setting**: An ancient living forest with sentient plants
- **Story**: You're a seedling spirit tasked with healing a corrupted Great Tree. Travel through mushroom caves, river deltas, and canopy villages. Gather natural remedies and earn trust of forest creatures
- **Inventory items**: Healing Pollen, River Stone, Firefly Lantern, Root Key, Blossom Charm
- **Win condition**: Reach the Great Tree's heart and apply the remedies
- **UI style**: Parchment scroll display

## Mechanics

### Scene Engine
- State machine: current scene ID + inventory set
- Scene data structure:
  ```typescript
  {
    id: string;
    text: string;
    choices: {
      label: string;
      nextScene: string;
      requiredItem?: string;
      itemGained?: string;
    }[];
  }
  ```

### Inventory
- Maximum 5 items
- Displayed in sidebar panel
- Items unlock specific choices (greyed out if item missing)

### Progression
- 15-20 scenes per variant
- 2-3 branching paths
- 1 optimal path to victory
- 1-2 dead ends (with retry/restart option)

### UI Layout
- Scene text in a scrollable area (themed per variant)
- Choice buttons below the text area
- Inventory sidebar on the right

### Theme Switch Behavior
- Theme change mid-game resets state with "Theme changed — restarting" message
- Implemented via `useEffect` watching `theme.id`

## Technical Implementation

### Files
- `FictionEngine.ts` — Pure functions: `getScene(state)`, `makeChoice(state, choiceIndex) => newState`
- `FictionGame.tsx` — `useReducer` with `{ currentScene, inventory, history }` state
- `Inventory.tsx` — Reads inventory from game state, renders themed item cards
- `content/retro.ts` — Retro story content
- `content/futuristic.ts` — Futuristic story content
- `content/organic.ts` — Organic story content

### State Shape
```typescript
{
  currentScene: string;
  inventory: Set<string>;
  history: string[]; // visited scene IDs
}
```
