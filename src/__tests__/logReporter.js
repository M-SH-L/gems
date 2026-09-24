import { writeFileSync, mkdirSync } from 'fs';
import { basename, resolve } from 'path';

const THEMES = ['retro', 'futuristic', 'organic'];

export default class LogReporter {
  onTestRunEnd(testModules) {
    const startTime = Date.now();
    const log = {
      timestamp: new Date().toISOString(),
      duration_ms: 0,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      games: {},
    };

    for (const testModule of testModules ?? []) {
      // e.g. src/__tests__/scenarios/fiction.scenarios.test.ts -> "fiction"
      const game = basename(testModule.moduleId ?? '').split('.')[0] || 'unknown';
      const entry = (log.games[game] ??= {
        scenarios_run: 0,
        scenarios_passed: 0,
        themes_tested: [],
        details: [],
      });

      for (const testCase of testModule.children?.allTests?.() ?? []) {
        const result = testCase.result();
        const state = result.state;
        log.summary.total++;
        if (state === 'passed') log.summary.passed++;
        else if (state === 'failed') log.summary.failed++;
        else log.summary.skipped++;

        const name = testCase.fullName ?? testCase.name;
        const theme = THEMES.find((id) => name.toLowerCase().includes(id)) ?? 'all';
        if (!entry.themes_tested.includes(theme)) entry.themes_tested.push(theme);
        entry.scenarios_run++;
        if (state === 'passed') entry.scenarios_passed++;
        entry.details.push({
          name,
          theme,
          status: state === 'passed' ? 'pass' : state === 'failed' ? 'fail' : 'skip',
          duration_ms: Math.round(testCase.diagnostic?.()?.duration ?? 0),
          ...(state === 'failed' && result.errors?.[0]
            ? { error: String(result.errors[0].message ?? result.errors[0]) }
            : {}),
        });
      }
    }

    log.duration_ms = Date.now() - startTime;

    const outDir = resolve(process.cwd(), 'test-results');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      resolve(outDir, 'scenarios.log.json'),
      JSON.stringify(log, null, 2)
    );
  }
}
