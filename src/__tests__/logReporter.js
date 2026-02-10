import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

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
      for (const testCase of testModule.children?.allTests?.() ?? []) {
        const state = testCase.result().state;
        log.summary.total++;
        if (state === 'passed') log.summary.passed++;
        else if (state === 'failed') log.summary.failed++;
        else log.summary.skipped++;
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
