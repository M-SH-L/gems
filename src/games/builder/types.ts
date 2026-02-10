export interface BuilderItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  color: string;
  baseScore?: number;
}

export interface AdjacencyRule {
  item: string;
  neighbor: string;
  bonus: number;
}

export interface GridBackground {
  color: string;
  image: string;
  size?: string;
}

export interface BuilderContent {
  id: string;
  title: string;
  description: string;
  scoreLabel: string;
  gridBackground: GridBackground;
  items: BuilderItem[];
  adjacencyRules: AdjacencyRule[];
}
