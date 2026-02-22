import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const errorOut = (data: string, hideWarning = false) => {
  if (
    data?.toLowerCase()?.includes('error') &&
    !data?.toLowerCase()?.includes('warn') &&
    !data?.includes('ESLint must be installed') &&
    !data?.startsWith('error Command failed.')
  ) {
    core.error(data);
  } else if (!hideWarning && data?.toLowerCase()?.includes('warn')) {
    core.warning(data);
  } else {
    core.debug(data);
  }
};

export async function runAction(opts: {
  op: string;
  argsInput?: string;
  hideWarning?: boolean;
  file?: string;
  fail?: boolean;
}) {
  const { op, argsInput, hideWarning = false, file, fail = true } = opts;

  const args: string[] = argsInput
    ? argsInput
        .replace(/'/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Basic input validation to fail fast and avoid accidental injection-like values
  if (!op || !op.trim()) {
    core.setFailed('Input "cmd" is required and must not be empty.');
    return { exitCode: 1 };
  }

  // Disallow NULs and newlines in inputs which could cause unexpected behavior
  // Avoid control characters in regex literals to satisfy eslint no-control-regex.
  const containsInvalid = (s: string | undefined) => {
    if (!s) return false;
    return s.indexOf('\0') !== -1 || s.indexOf('\r') !== -1 || s.indexOf('\n') !== -1;
  };
  if (containsInvalid(op) || containsInvalid(argsInput) || containsInvalid(file)) {
    core.setFailed('Inputs must not contain NUL, CR, or LF characters.');
    return { exitCode: 1 };
  }

  // Limit lengths to reasonable sizes to avoid DoS via extremely large inputs
  if (op.length > 1024 || (args && args.join(' ').length > 8192)) {
    core.setFailed('Input too long.');
    return { exitCode: 1 };
  }

  let output = '';
  let stdout = '';
  let stderr = '';
  let exitCode = 0;

  const start = performance.now();

  try {
    core.debug('Running command: ' + op + ' ' + args.join(' '));
    // ignoreReturnCode to capture non-zero exit codes without throwing
    exitCode = await exec.exec(op, args, {
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString();
          output += data.toString();
          core.debug(data.toString());
        },
        stderr: (data: Buffer) => {
          stderr += data.toString();
          output += data.toString();
          errorOut(data.toString(), hideWarning);
        }
      },
      ignoreReturnCode: true
    });
  } catch (err) {
    exitCode = 1;
    core.setFailed(`Unexpected error: ${(<Error>err).message}`);
  }

  core.setOutput('exit-code', exitCode);

  const end = performance.now();
  core.setOutput('duration', ((end - start) / 1000).toFixed(2));

  output = output.trim();
  core.debug(`\n*************\nFinal output:\n*************\n${output}`);
  core.setOutput('output', output);

  core.setOutput('stdout', stdout);
  core.setOutput('stderr', stderr);

  try {
    if (file) {
      const dir = path.dirname(file);
      if (dir && dir !== '.') {
        await io.mkdirP(dir);
      }
      await writeFile(file, output);
    }
  } catch (err) {
    core.setFailed(`Failed to write output to file: ${(<Error>err).message}`);
  }

  if (fail && exitCode != 0) {
    core.setFailed(stderr || stdout || output || `Process exited with code ${exitCode}`);
  }

  return { exitCode, output, stdout, stderr };
}

// Only auto-run when not executing under a test runner (Vitest sets VITEST=1)
if (!process.env.VITEST) {
  (async () => {
    await runAction({
      op: core.getInput('cmd'),
      argsInput: core.getInput('args'),
      hideWarning: core.getInput('hide-warnings') === 'true',
      file: core.getInput('file'),
      fail: core.getInput('fail') === 'true'
    });
  })();
}
