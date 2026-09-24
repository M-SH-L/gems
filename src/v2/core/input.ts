/** Normalised game actions shared by every V2 screen. */
export type Action = 'left' | 'right' | 'up' | 'down' | 'jump' | 'confirm' | 'back' | 'restart';

const KEYMAP: Record<string, Action[]> = {
  ArrowLeft: ['left'],
  KeyA: ['left'],
  ArrowRight: ['right'],
  KeyD: ['right'],
  ArrowUp: ['up', 'jump'],
  KeyW: ['up', 'jump'],
  ArrowDown: ['down'],
  KeyS: ['down'],
  Space: ['jump', 'confirm'],
  Enter: ['confirm'],
  Escape: ['back'],
  KeyR: ['restart'],
};

export function actionsForKey(code: string): Action[] {
  return KEYMAP[code] ?? [];
}

/**
 * Tracks held actions and emits presses. Ignores keys typed into form fields
 * so the HUD stays usable.
 */
export class Input {
  private held = new Set<Action>();
  private listeners = new Set<(a: Action) => void>();

  constructor() {
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('blur', this.onBlur);
  }

  isHeld(a: Action) {
    return this.held.has(a);
  }

  onPress(fn: (a: Action) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Feed a synthetic press (used by touch / on-screen buttons). */
  press(a: Action) {
    this.listeners.forEach((fn) => fn(a));
  }

  setHeld(a: Action, on: boolean) {
    if (on) this.held.add(a);
    else this.held.delete(a);
  }

  private onDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    const actions = actionsForKey(e.code);
    if (actions.length === 0) return;
    // Keep Space from activating a focused HUD button as well as the game.
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    const fresh = !e.repeat;
    for (const a of actions) {
      this.held.add(a);
      if (fresh) this.press(a);
    }
  };

  private onUp = (e: KeyboardEvent) => {
    for (const a of actionsForKey(e.code)) this.held.delete(a);
  };

  private onBlur = () => this.held.clear();

  dispose() {
    window.removeEventListener('keydown', this.onDown);
    window.removeEventListener('keyup', this.onUp);
    window.removeEventListener('blur', this.onBlur);
    this.listeners.clear();
    this.held.clear();
  }
}
