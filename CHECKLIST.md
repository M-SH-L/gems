# Game Hub — Progress Checklist

## Legend
- [ ] Not started
- [~] In progress
- [x] Completed

## Phase 1: Foundation
- [x] Project scaffolding (Vite + React + TS + Tailwind)
- [x] Testing setup (Vitest + Testing Library + Playwright)
- [x] Documentation files created (docs/*.md)

## Phase 2: Theme Engine
- [x] Theme definitions (themes.ts — 3 themes, all CSS vars)
- [x] CSS custom properties + Tailwind integration
- [x] ThemeContext provider
- [x] ThemeSwitcher component
- [x] Overlay effects (scanlines, hologram, grain)
- [x] Theme unit tests passing

## Phase 3: Desktop Shell
- [x] Desktop.tsx (full viewport, theme backgrounds)
- [x] MenuBar.tsx (clock, title, theme switcher, volume)
- [x] GameCard.tsx (themed cards with Play Now)
- [x] DesktopGrid.tsx (5-card layout)
- [x] Game registry (registry.ts)
- [x] Desktop component tests passing

## Phase 4: Window Manager
- [x] windowStore.ts (Zustand — open/close/min/max/focus/drag/resize)
- [x] WindowFrame.tsx (draggable, resizable, title bar buttons)
- [x] WindowManager.tsx (renders open windows)
- [x] useDrag.ts hook
- [x] Bottom taskbar for minimized windows
- [x] Window store unit tests passing
- [x] Window component tests passing
- [x] Window integration tests passing

## Phase 5: Sound System
- [ ] Sound files created/sourced (3 themes × 9 actions)
- [ ] SoundContext.tsx + soundMap.ts
- [ ] useSound.ts hook
- [ ] Volume control in MenuBar
- [ ] Sound wired to window events

## Phase 6: Game 1 — Interactive Fiction
- [ ] Content types defined
- [ ] Retro story content (15-20 scenes)
- [ ] Futuristic story content (15-20 scenes)
- [ ] Organic story content (15-20 scenes)
- [ ] FictionEngine.ts (state machine)
- [ ] FictionGame.tsx (renderer + choices)
- [ ] Inventory.tsx component
- [ ] Theme-switch reset behavior
- [ ] Fiction engine unit tests passing
- [ ] Fiction component tests passing
- [ ] Fiction scenario tests passing (all 3 variants)

## Phase 7: Game 2 — Circuit Puzzle
- [ ] Puzzle level format types
- [ ] PuzzleGrid.tsx (SVG renderer)
- [ ] PathDrawer.tsx (drag-to-draw + crossing validation)
- [ ] Retro puzzle content (5 levels)
- [ ] Futuristic puzzle content (5 levels)
- [ ] Organic puzzle content (5 levels)
- [ ] CircuitGame.tsx (level management, timer)
- [ ] Themed styling (PCB / conduits / roots)
- [ ] Circuit validation unit tests passing
- [ ] Circuit component tests passing
- [ ] Circuit scenario tests passing (auto-solver)

## Phase 8: Game 3 — Building/Simulation
- [ ] Item types + adjacency bonus format
- [ ] Grid.tsx (12x12 CSS grid)
- [ ] Palette.tsx (item selection sidebar)
- [ ] ScorePanel.tsx (budget + score)
- [ ] BuilderGame.tsx (state orchestration)
- [ ] Retro content (10 items + rules)
- [ ] Futuristic content (10 items + rules)
- [ ] Organic content (10 items + rules)
- [ ] Builder scoring unit tests passing
- [ ] Builder component tests passing
- [ ] Builder scenario tests passing

## Phase 9: Game 4 — Geography
- [ ] SVG world map sourced/created
- [ ] Custom star chart SVG created
- [ ] MapCanvas.tsx (SVG + click handling)
- [ ] LocationPin.tsx (themed markers)
- [ ] InfoPopup.tsx (landmark info cards)
- [ ] GeographyGame.tsx (rounds, scoring, reveal)
- [ ] Retro locations (10-15)
- [ ] Futuristic locations (10-15)
- [ ] Organic locations (10-15)
- [ ] Geo scoring unit tests passing
- [ ] Geo component tests passing
- [ ] Geo scenario tests passing

## Phase 10: Game 5 — Platformer
- [ ] useGameLoop.ts hook
- [ ] engine.ts (physics, collision, input)
- [ ] entities.ts (Player, Collectible, Hazard)
- [ ] renderer.ts (canvas draw)
- [ ] levels.ts (level parser)
- [ ] Retro levels (3 levels)
- [ ] Futuristic levels (3 levels)
- [ ] Organic levels (3 levels)
- [ ] PlatformerGame.tsx (canvas + HUD)
- [ ] Tuned jump feel
- [ ] Platformer engine unit tests passing
- [ ] Platformer component tests passing
- [ ] Platformer scenario tests passing

## Phase 11: Polish
- [ ] Window open/close animations
- [ ] Desktop background animations per theme
- [ ] Game card hover effects per theme
- [ ] Theme switch transition overlay
- [ ] Welcome splash screen
- [ ] localStorage high scores
- [ ] Responsive clamping (min 1024x768)

## Phase 12: Full Test Suite
- [ ] All unit tests passing
- [ ] All component tests passing
- [ ] All integration tests passing
- [ ] All scenario tests passing + log reviewed
- [ ] E2E tests passing
- [ ] Coverage >80% on core logic
- [ ] scenarios.log.json committed as baseline

## Phase 13: Final Review
- [ ] All 15 theme × game combinations manually verified
- [ ] Theme mid-game switch works for all games
- [ ] Sound plays correctly across all themes
- [ ] No console errors in any state
- [ ] Build succeeds (npm run build)
- [ ] Production build tested locally
