import { describe, it, expect } from 'vitest';
import { fictionContentByTheme } from '@/games/fiction/content';
import {
  createInitialState,
  getScene,
  isChoiceAvailable,
  makeChoice,
} from '@/games/fiction/FictionEngine';
import type { FictionContent, FictionScene } from '@/games/fiction/types';

function serializeInventory(inventory: Set<string>) {
  return [...inventory].sort().join('|');
}

function exploreContent(content: FictionContent) {
  const visitedStates = new Set<string>();
  const reachableScenes = new Set<string>();
  const winScenes = new Set<string>();

  const queue: { sceneId: string; inventory: Set<string> }[] = [
    { sceneId: content.startScene, inventory: new Set() },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const stateKey = `${current.sceneId}::${serializeInventory(current.inventory)}`;
    if (visitedStates.has(stateKey)) continue;
    visitedStates.add(stateKey);

    const scene = content.scenes.find((entry) => entry.id === current.sceneId);
    if (!scene) continue;

    reachableScenes.add(scene.id);
    if (scene.ending === 'win') winScenes.add(scene.id);

    for (const choice of scene.choices) {
      if (choice.requiredItem && !current.inventory.has(choice.requiredItem)) {
        continue;
      }
      const nextInventory = new Set(current.inventory);
      if (choice.itemGained) nextInventory.add(choice.itemGained);
      queue.push({ sceneId: choice.nextScene, inventory: nextInventory });
    }
  }

  return { reachableScenes, winScenes };
}

describe('FictionEngine', () => {
  it('creates initial state with correct start scene', () => {
    const content = fictionContentByTheme.retro;
    const state = createInitialState(content);
    expect(state.currentScene).toBe(content.startScene);
    expect(state.inventory.size).toBe(0);
    expect(state.status).toBe('playing');
  });

  it('transitions to next scene when a choice is made', () => {
    const content = fictionContentByTheme.retro;
    let state = createInitialState(content);
    state = makeChoice(content, state, 0);
    expect(state.currentScene).toBe('hallway');
  });

  it('prevents required choices without the item', () => {
    const content = fictionContentByTheme.retro;
    const sceneState = {
      ...createInitialState(content),
      currentScene: 'hallway',
      history: ['hallway'],
    };
    const scene = getScene(content, sceneState);
    const lockedIndex = scene.choices.findIndex((choice) => choice.requiredItem);
    const nextState = makeChoice(content, sceneState, lockedIndex);
    expect(nextState.currentScene).toBe('hallway');
    expect(nextState.lastEvent).toContain('Requires');
  });

  it('adds items when chosen', () => {
    const content = fictionContentByTheme.retro;
    let state = createInitialState(content);
    state = makeChoice(content, state, 1);
    expect(state.inventory.has('Rusty Key')).toBe(true);
  });

  it('marks choices as available only when requirements met', () => {
    const content = fictionContentByTheme.retro;
    const state = {
      ...createInitialState(content),
      currentScene: 'hallway',
      history: ['hallway'],
    };
    const scene = getScene(content, state);
    const lockedChoice = scene.choices.find((choice) => choice.requiredItem);
    expect(lockedChoice).toBeDefined();
    if (lockedChoice) {
      expect(isChoiceAvailable(lockedChoice, state)).toBe(false);
    }
  });

  it('ensures all scenes are reachable and a win exists per theme', () => {
    (Object.values(fictionContentByTheme) as FictionContent[]).forEach((content) => {
      const { reachableScenes, winScenes } = exploreContent(content);
      const allScenes = new Set(content.scenes.map((scene) => scene.id));
      expect(reachableScenes).toEqual(allScenes);
      expect(winScenes.size).toBeGreaterThan(0);
    });
  });

  it('ensures non-ending scenes have choices', () => {
    (Object.values(fictionContentByTheme) as FictionContent[]).forEach((content) => {
      content.scenes.forEach((scene: FictionScene) => {
        if (scene.ending) {
          expect(scene.choices.length).toBe(0);
        } else {
          expect(scene.choices.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
