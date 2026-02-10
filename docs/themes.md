# Theme Engine

## Overview

Three baked-in themes (Retro, Futuristic, Organic) affect everything: UI chrome, game content/assets, animations, and sounds. Theme switching is instant with smooth CSS transitions.

## Architecture

### CSS Custom Properties
- Set on `:root` element
- Control: colors, fonts, border-radius, borders, shadows, transition speed
- Changed dynamically when theme switches

### ThemeContext (React Context)
- Holds active theme ID
- Applies CSS vars to `document.documentElement` on change
- Provides `theme` object and `setTheme` function

### Tailwind Integration
- Tailwind config extends colors/fonts/radii to reference CSS vars
- Utility classes: `bg-primary`, `text-accent`, `font-theme`, `rounded-theme`

### Content Maps
- Each game indexes `content[theme.id]` to load theme-specific stories, levels, assets
- Content is statically imported, not fetched

### Transitions
- CSS `transition` on themed properties for smooth visual changes
- Brief fade overlay during switch to mask content swap

### Overlay Effects
- **Retro**: CSS scanlines pseudo-element (repeating linear gradient)
- **Futuristic**: Holographic shimmer (animated gradient)
- **Organic**: Paper grain texture (noise pattern)

## Theme Definitions

### Retro
| Property | Value |
|----------|-------|
| Background | `#0a0a0a` |
| Primary accent | `#39ff14` (neon green) |
| Secondary accent | `#ff6600` (orange) |
| Font | Press Start 2P |
| Border radius | 0px |
| Borders | 2px solid |
| Overlay | CRT scanline effect |
| Sounds | 8-bit beeps and blips |

### Futuristic
| Property | Value |
|----------|-------|
| Background | `#0b0e1a` |
| Primary accent | `#00e5ff` (cyan) |
| Secondary accent | `#e040fb` (magenta) |
| Font | Orbitron |
| Border radius | 12px |
| Borders | 1px with glow effect |
| Overlay | Holographic shimmer |
| Sounds | Synth tones |

### Organic
| Property | Value |
|----------|-------|
| Background | `#f5f0e8` |
| Primary accent | `#2d6a4f` (green) |
| Secondary accent | `#d4a373` (amber) |
| Font | Caveat (handwritten) |
| Border radius | 20px (organic) |
| Borders | Dashed/hand-drawn style |
| Overlay | Paper grain texture |
| Sounds | Nature clicks and rustles |

## Theme Switch Behavior in Games

When theme changes mid-game, the game resets with a brief "Theme changed — restarting" message. This avoids impossible state mapping between different content sets.

## Technical Implementation

### Files
- `themes.ts` — Theme definition objects with all CSS var values
- `ThemeContext.tsx` — React Context provider, applies vars to `:root`
- `useTheme.ts` — Hook to access current theme and setter
- `ThemeSwitcher.tsx` — Dropdown UI component with 3 theme options

### Theme Object Shape
```typescript
interface Theme {
  id: 'retro' | 'futuristic' | 'organic';
  name: string;
  vars: Record<string, string>; // CSS custom property key-value pairs
}
```

### CSS Variables Applied
```css
:root {
  --color-bg: ...;
  --color-primary: ...;
  --color-secondary: ...;
  --color-text: ...;
  --color-surface: ...;
  --font-theme: ...;
  --radius-theme: ...;
  --border-theme: ...;
  --shadow-theme: ...;
  --transition-speed: ...;
}
```
