import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { writeFile } from 'node:fs/promises';
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

(async () => {
  const op: string = core.getInput('cmd');
  const args: string[] = core.getInput('args')?.replace(/'/g, '').split(',');
  const hideWarning: boolean = core.getInput('hide-warnings') === 'true';
  const file: string = core.getInput('file');
  const fail: boolean = core.getInput('fail') === 'true';

  let output = '';
  let stdout = '';
  let stderr = '';
  let exitCode = 0;

  const start = performance.now();

  try {
    core.debug('Running command: ' + op + ' ' + args.join(' '));
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
      }
    });
  } catch (err) {
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
      const path = file.split('/');
      path.pop();
      const dir = path.join('/');
      await io.mkdirP(dir);
      await writeFile(file, output);
    }
  } catch (err) {
    core.setFailed(`Failed to write output to file: ${(<Error>err).message}`);
  }

  if (fail && exitCode != 0) {
    core.setFailed(stderr);
  }
})();
