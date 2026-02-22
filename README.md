# Capture Output Action

Capture the output (and duration) of a command as a GitHub Actions `output` or file

## How to use this Action

Required inputs:

- `cmd`: The Bash command you want to run

Optional inputs:

- `args`: A comma-separated list of arguments with which to run the command
- `hide-warnings`: Hide warnings in the GitHub Actions logs (defaults to `false`)
- `fail`: Fail the step if an error is detected (defaults to `true`)
- `file`: The file to in which to record the output

Outputs:

- `output`: The full command output (stdout + stderr)
- `stdout`: The result of stdout
- `stderr`: The result of stderr
- `exit-code`: The command's exit code
- `duration`: The time the command took to run, in seconds

```yaml
name: Capture output
on:
  workflow_dispatch:
jobs:
  capture-output:
    runs-on: ubuntu-latest
    steps:
      - name: Capture output
        uses: 'selfagency/capture-output@v2'
        with:
          cmd: yarn
          args: run,build,--verbose
          hide-warnings: true
          fail: false
          file: ${{ github.workspace }}/output.txt
```

## Development

Build locally:

```bash
pnpm install
pnpm build
```

Run the action source directly (good for local debugging):

```bash
# requires tsx installed (npx tsx src/action.ts will run using npx)
npx tsx src/action.ts
```

## CI

This repository includes a CI workflow at `.github/workflows/ci.yml` that:

- checks out the code
- installs dependencies with `pnpm`
- runs `pnpm build`
- runs `pnpm lint`

## Security notes

- The action validates that `cmd` is provided and disallows NUL/newline characters in inputs.
- The action captures stdout/stderr and writes files only after creating directories safely.
- Do not pass untrusted input to `cmd`/`args` from third-party workflow inputs; prefer hard-coded commands or validated parameters.

If you'd like I can add more example workflows (writing to a file in the workspace, capturing output of long-running tools, etc.).
