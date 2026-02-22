import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  setFailed: vi.fn(),
  setOutput: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
  error: vi.fn()
}));

vi.mock('@actions/exec', () => ({ exec: vi.fn() }));
vi.mock('@actions/io', () => ({ mkdirP: vi.fn() }));
vi.mock('node:fs/promises', () => ({ writeFile: vi.fn() }));

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as fs from 'node:fs/promises';
import { runAction } from '../action.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('runAction', () => {
  it('fails when cmd is empty', async () => {
    const res = await runAction({ op: '' });
    expect(core.setFailed).toHaveBeenCalledWith('Input "cmd" is required and must not be empty.');
    expect(res.exitCode).toBe(1);
  });

  it('writes output to file and creates directory', async () => {
    (exec.exec as any).mockImplementation(async (_op: string, _args: string[], opts: any) => {
      if (opts.listeners?.stdout) opts.listeners.stdout(Buffer.from('hello stdout\n'));
      if (opts.listeners?.stderr) opts.listeners.stderr(Buffer.from('warning: caution\n'));
      return 0;
    });

    const res = await runAction({ op: 'echo', argsInput: 'a,b', hideWarning: false, file: 'tmp/out.txt', fail: false });

    expect(io.mkdirP).toHaveBeenCalledWith('tmp');
    expect(fs.writeFile).toHaveBeenCalledWith('tmp/out.txt', 'hello stdout\nwarning: caution');
    expect(res.exitCode).toBe(0);
    expect(res.output).toContain('hello stdout');
  });

  it('sets failed when exit code non-zero and fail true', async () => {
    (exec.exec as any).mockImplementation(async (_op: string, _args: string[], opts: any) => {
      if (opts.listeners?.stderr) opts.listeners.stderr(Buffer.from('error: bad things\n'));
      return 2;
    });

    const res = await runAction({ op: 'badcmd', argsInput: '', hideWarning: false, fail: true });
    expect(core.setFailed).toHaveBeenCalled();
    // ensure the failure message includes our stderr
    expect((core.setFailed as any).mock.calls[0][0]).toContain('error: bad things');
    expect(res.exitCode).toBe(2);
  });
});
