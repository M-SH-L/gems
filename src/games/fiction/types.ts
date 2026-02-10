export type FictionEnding = 'win' | 'lose';

export interface FictionChoice {
  label: string;
  nextScene: string;
  requiredItem?: string;
  itemGained?: string;
}

export interface FictionScene {
  id: string;
  text: string;
  choices: FictionChoice[];
  ending?: FictionEnding;
}

export interface FictionContent {
  id: 'retro' | 'futuristic' | 'organic';
  title: string;
  intro: string;
  startScene: string;
  scenes: FictionScene[];
}
