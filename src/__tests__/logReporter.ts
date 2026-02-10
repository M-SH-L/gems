import { experimental_getRunnerTask, type Reporter } from 'vitest/node';
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

export default class LogReporter implements Reporter {
  onTestRunEnd(
    testModules: Parameters<NonNullable<Reporter['onTestRunEnd']>>[0]
  ) {
    const startTime = Date.now();
    const log: TestLog = {
      timestamp: new Date().toISOString(),
      duration_ms: 0,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      games: {},
    };

    const walkTasks = (task: any) => {
      if (task?.type === 'test') {
        log.summary.total++;
        if (task.result?.state === 'pass') log.summary.passed++;
        else if (task.result?.state === 'fail') log.summary.failed++;
        else log.summary.skipped++;
      }
      if (task?.tasks?.length) {
        for (const child of task.tasks) walkTasks(child);
      }
    };

    for (const module of testModules ?? []) {
      const fileTask = experimental_getRunnerTask(module as any) as any;
      if (fileTask?.tasks?.length) {
        for (const task of fileTask.tasks) walkTasks(task);
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
