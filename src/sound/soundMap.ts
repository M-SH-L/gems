import type { Theme } from '../theme/themes';

export type SoundAction =
  | 'click'
  | 'open'
  | 'close'
  | 'game_start'
  | 'collect'
  | 'place'
  | 'connect'
  | 'win'
  | 'lose';

export const soundActions: SoundAction[] = [
  'click',
  'open',
  'close',
  'game_start',
  'collect',
  'place',
  'connect',
  'win',
  'lose',
];

export const soundMap: Record<Theme['id'], Record<SoundAction, string>> = {
  retro: {
    click: '/sounds/retro/click.wav',
    open: '/sounds/retro/open.wav',
    close: '/sounds/retro/close.wav',
    game_start: '/sounds/retro/game_start.wav',
    collect: '/sounds/retro/collect.wav',
    place: '/sounds/retro/place.wav',
    connect: '/sounds/retro/connect.wav',
    win: '/sounds/retro/win.wav',
    lose: '/sounds/retro/lose.wav',
  },
  futuristic: {
    click: '/sounds/futuristic/click.wav',
    open: '/sounds/futuristic/open.wav',
    close: '/sounds/futuristic/close.wav',
    game_start: '/sounds/futuristic/game_start.wav',
    collect: '/sounds/futuristic/collect.wav',
    place: '/sounds/futuristic/place.wav',
    connect: '/sounds/futuristic/connect.wav',
    win: '/sounds/futuristic/win.wav',
    lose: '/sounds/futuristic/lose.wav',
  },
  organic: {
    click: '/sounds/organic/click.wav',
    open: '/sounds/organic/open.wav',
    close: '/sounds/organic/close.wav',
    game_start: '/sounds/organic/game_start.wav',
    collect: '/sounds/organic/collect.wav',
    place: '/sounds/organic/place.wav',
    connect: '/sounds/organic/connect.wav',
    win: '/sounds/organic/win.wav',
    lose: '/sounds/organic/lose.wav',
  },
};
