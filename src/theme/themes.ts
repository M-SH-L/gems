export interface Theme {
  id: 'retro' | 'futuristic' | 'organic';
  name: string;
  vars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    id: 'retro',
    name: 'Retro',
    vars: {
      '--color-bg': '#0a0a0a',
      '--color-primary': '#39ff14',
      '--color-secondary': '#ff6600',
      '--color-text': '#39ff14',
      '--color-surface': '#1a1a1a',
      '--font-theme': '"Press Start 2P", monospace',
      '--radius-theme': '0px',
      '--border-theme': '2px solid #39ff14',
      '--shadow-theme': '0 0 10px #39ff14',
      '--transition-speed': '0.3s',
    },
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    vars: {
      '--color-bg': '#0b0e1a',
      '--color-primary': '#00e5ff',
      '--color-secondary': '#e040fb',
      '--color-text': '#e0e0e0',
      '--color-surface': '#131830',
      '--font-theme': '"Orbitron", sans-serif',
      '--radius-theme': '12px',
      '--border-theme': '1px solid #00e5ff',
      '--shadow-theme': '0 0 20px rgba(0, 229, 255, 0.3)',
      '--transition-speed': '0.3s',
    },
  },
  {
    id: 'organic',
    name: 'Organic',
    vars: {
      '--color-bg': '#f5f0e8',
      '--color-primary': '#2d6a4f',
      '--color-secondary': '#d4a373',
      '--color-text': '#2d2d2d',
      '--color-surface': '#ede4d4',
      '--font-theme': '"Caveat", cursive',
      '--radius-theme': '20px',
      '--border-theme': '2px dashed #2d6a4f',
      '--shadow-theme': '0 2px 8px rgba(0, 0, 0, 0.1)',
      '--transition-speed': '0.3s',
    },
  },
];
