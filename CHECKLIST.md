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
- [x] Content types defined
- [x] Retro story content (15-20 scenes)
- [x] Futuristic story content (15-20 scenes)
- [x] Organic story content (15-20 scenes)
- [x] FictionEngine.ts (state machine)
- [x] FictionGame.tsx (renderer + choices)
- [x] Inventory.tsx component
- [x] Theme-switch reset behavior
- [x] Fiction engine unit tests passing
- [x] Fiction component tests passing
- [x] Fiction scenario tests passing (all 3 variants)

## Phase 7: Game 2 — Circuit Puzzle
- [x] Puzzle level format types
- [x] PuzzleGrid.tsx (SVG renderer)
- [x] PathDrawer.tsx (drag-to-draw + crossing validation)
- [x] Retro puzzle content (5 levels)
- [x] Futuristic puzzle content (5 levels)
- [x] Organic puzzle content (5 levels)
- [x] CircuitGame.tsx (level management, timer)
- [x] Themed styling (PCB / conduits / roots)
- [x] Circuit validation unit tests passing
- [x] Circuit component tests passing
- [x] Circuit scenario tests passing (auto-solver)

## Phase 8: Game 3 — Building/Simulation
- [x] Item types + adjacency bonus format
- [x] Grid.tsx (12x12 CSS grid)
- [x] Palette.tsx (item selection sidebar)
- [x] ScorePanel.tsx (budget + score)
- [x] BuilderGame.tsx (state orchestration)
- [x] Retro content (10 items + rules)
- [x] Futuristic content (10 items + rules)
- [x] Organic content (10 items + rules)
- [x] Builder scoring unit tests passing
- [x] Builder component tests passing
- [x] Builder scenario tests passing

## Phase 9: Game 4 — Geography
- [x] SVG world map sourced/created
- [x] Custom star chart SVG created
- [x] MapCanvas.tsx (SVG + click handling)
- [x] LocationPin.tsx (themed markers)
- [x] InfoPopup.tsx (landmark info cards)
- [x] GeographyGame.tsx (rounds, scoring, reveal)
- [x] Retro locations (10-15)
- [x] Futuristic locations (10-15)
- [x] Organic locations (10-15)
- [x] Geo scoring unit tests passing
- [x] Geo component tests passing
- [x] Geo scenario tests passing

## Phase 10: Game 5 — Platformer
- [x] useGameLoop.ts hook
- [x] engine.ts (physics, collision, input)
- [x] entities.ts (Player, Collectible, Hazard)
- [x] renderer.ts (canvas draw)
- [x] levels.ts (level parser)
- [x] Retro levels (3 levels)
- [x] Futuristic levels (3 levels)
- [x] Organic levels (3 levels)
- [x] PlatformerGame.tsx (canvas + HUD)
- [x] Tuned jump feel
- [x] Platformer engine unit tests passing
- [x] Platformer component tests passing
- [x] Platformer scenario tests passing

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
