import { describe, it, expect } from 'vitest';
import { fictionContentByTheme } from '@/games/fiction/content';
import {
  createInitialState,
  getScene,
  makeChoice,
  type FictionState,
} from '@/games/fiction/FictionEngine';
import type { FictionContent } from '@/games/fiction/types';

function serializeInventory(inventory: Set<string>) {
  return [...inventory].sort().join('|');
}

function findShortestWinPath(content: FictionContent) {
  type Node = { state: FictionState; path: number[] };
  const startState = createInitialState(content);
  const queue: Node[] = [{ state: startState, path: [] }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { state, path } = queue.shift() as Node;
    const key = `${state.currentScene}::${serializeInventory(state.inventory)}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const scene = getScene(content, state);
    if (scene.ending === 'win') return path;

    scene.choices.forEach((choice, index) => {
      if (choice.requiredItem && !state.inventory.has(choice.requiredItem)) {
        return;
      }
      const nextState = makeChoice(content, state, index);
      queue.push({ state: nextState, path: [...path, index] });
    });
  }

  return null;
}

function reachableScenes(content: FictionContent) {
  const visitedStates = new Set<string>();
  const reachable = new Set<string>();
  const queue: { sceneId: string; inventory: Set<string> }[] = [
    { sceneId: content.startScene, inventory: new Set() },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    const key = `${current.sceneId}::${serializeInventory(current.inventory)}`;
    if (visitedStates.has(key)) continue;
    visitedStates.add(key);

    const scene = content.scenes.find((entry) => entry.id === current.sceneId);
    if (!scene) continue;

    reachable.add(scene.id);

    scene.choices.forEach((choice) => {
      if (choice.requiredItem && !current.inventory.has(choice.requiredItem)) {
        return;
      }
      const nextInventory = new Set(current.inventory);
      if (choice.itemGained) nextInventory.add(choice.itemGained);
      queue.push({ sceneId: choice.nextScene, inventory: nextInventory });
    });
  }

  return reachable;
}

describe('fiction scenarios', () => {
  (Object.values(fictionContentByTheme) as FictionContent[]).forEach((content) => {
    it(`finds a win path for ${content.id}`, () => {
      const path = findShortestWinPath(content);
      expect(path).not.toBeNull();

      let state = createInitialState(content);
      path?.forEach((index) => {
        state = makeChoice(content, state, index);
      });

      const scene = getScene(content, state);
      expect(scene.ending).toBe('win');
    });

    it(`can reach every scene for ${content.id}`, () => {
      const reachable = reachableScenes(content);
      expect(reachable.size).toBe(content.scenes.length);
    });

    it(`validates gated choices for ${content.id}`, () => {
      const gatedScene = content.scenes.find((scene) =>
        scene.choices.some((choice) => choice.requiredItem)
      );

      if (!gatedScene) {
        expect(true).toBe(true);
        return;
      }

      const gatedIndex = gatedScene.choices.findIndex((choice) => choice.requiredItem);
      const state = {
        ...createInitialState(content),
        currentScene: gatedScene.id,
        history: [gatedScene.id],
      };
      const blockedState = makeChoice(content, state, gatedIndex);
      expect(blockedState.currentScene).toBe(state.currentScene);
      expect(blockedState.lastEvent).toContain('Requires');
    });
  });
});
