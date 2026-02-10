import type { Reporter } from 'vitest/reporters';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

interface ScenarioDetail {
  name: string;
  theme: string;
  status: 'pass' | 'fail';
  duration_ms: number;
  log: Record<string, unknown>;
  error?: string;
}

interface GameTestResult {
  scenarios_run: number;
  scenarios_passed: number;
  themes_tested: string[];
  details: ScenarioDetail[];
}

interface TestLog {
  timestamp: string;
  duration_ms: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  games: Record<string, GameTestResult>;
}

const LogReporter: Reporter = {
  onFinished(files) {
    const startTime = Date.now();
    const log: TestLog = {
      timestamp: new Date().toISOString(),
      duration_ms: 0,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      games: {},
    };

    for (const file of files ?? []) {
      for (const task of file.tasks ?? []) {
        log.summary.total++;
        if (task.result?.state === 'pass') log.summary.passed++;
        else if (task.result?.state === 'fail') log.summary.failed++;
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
  },
};

export default LogReporter;
