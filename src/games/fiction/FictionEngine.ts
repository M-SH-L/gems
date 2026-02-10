import type { FictionChoice, FictionContent, FictionScene } from './types';

export type FictionStatus = 'playing' | 'win' | 'lose';

export interface FictionState {
  currentScene: string;
  inventory: Set<string>;
  history: string[];
  status: FictionStatus;
  lastEvent?: string;
}

export const MAX_INVENTORY = 5;

export function createInitialState(content: FictionContent): FictionState {
  return {
    currentScene: content.startScene,
    inventory: new Set(),
    history: [content.startScene],
    status: 'playing',
  };
}

export function getSceneById(content: FictionContent, id: string): FictionScene {
  const scene = content.scenes.find((entry) => entry.id === id);
  if (!scene) {
    throw new Error(`Scene not found: ${id}`);
  }
  return scene;
}

export function getScene(content: FictionContent, state: FictionState): FictionScene {
  return getSceneById(content, state.currentScene);
}

export function isChoiceAvailable(choice: FictionChoice, state: FictionState): boolean {
  if (!choice.requiredItem) return true;
  return state.inventory.has(choice.requiredItem);
}

export function makeChoice(
  content: FictionContent,
  state: FictionState,
  choiceIndex: number
): FictionState {
  if (state.status !== 'playing') return state;

  const scene = getScene(content, state);
  const choice = scene.choices[choiceIndex];

  if (!choice) return state;

  if (choice.requiredItem && !state.inventory.has(choice.requiredItem)) {
    return {
      ...state,
      lastEvent: `Requires ${choice.requiredItem}`,
    };
  }

  const inventory = new Set(state.inventory);
  let lastEvent: string | undefined;

  if (choice.itemGained && !inventory.has(choice.itemGained)) {
    if (inventory.size < MAX_INVENTORY) {
      inventory.add(choice.itemGained);
      lastEvent = `Picked up ${choice.itemGained}`;
    } else {
      lastEvent = 'Inventory full';
    }
  }

  const nextScene = getSceneById(content, choice.nextScene);
  const status: FictionStatus = nextScene.ending ?? 'playing';

  return {
    currentScene: nextScene.id,
    inventory,
    history: [...state.history, nextScene.id],
    status,
    lastEvent,
  };
}
