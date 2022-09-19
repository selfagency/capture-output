import { performance } from 'perf_hooks';
import { writeFile } from 'fs/promises';
import core from '@actions/core';
import exec from '@actions/exec';

const errorOut = (data: string, hideWarning?: boolean) => {
  if (
    data?.toLowerCase()?.includes('error') &&
    !data?.toLowerCase()?.includes('warn') &&
    !data?.includes('ESLint must be installed') &&
    !data?.startsWith('error Command failed.')
  ) {
    core.setFailed(data);
  } else if (!hideWarning && data?.toLowerCase()?.includes('warn')) {
    core.warning(data);
  } else {
    core.debug(data);
  }
};

(async () => {
  try {
    const op: string = core.getInput('cmd');
    const args: string[] = core.getInput('args')?.split(' ');
    const hideWarning: boolean = core.getInput('hide-warning') === 'true';
    const file: string = core.getInput('file');
    let output = '';

    const start = performance.now();

    core.debug('Running command: ' + op + ' ' + args.join(' '));
    await exec.exec(op, args, {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
          core.debug(data.toString());
        },
        stderr: (data: Buffer) => {
          output += data.toString();
          errorOut(data.toString(), hideWarning);
        }
      }
    });

    const end = performance.now();
    core.setOutput('duration', ((end - start) / 1000).toFixed(2));

    output = output.trim();
    core.debug(`\n*************\nFinal output:\n*************\n${output}`);
    core.setOutput('output', output);

    if (file) {
      await writeFile(file, output);
    }
  } catch (err) {
    core.setFailed((<Error>err).message);
  }
})();
