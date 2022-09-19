# Capture Output Action

Capture the output (and duration) of a command as a GitHub Actions `output` or file

## How to use this Action

Required inputs:

- `cmd`: The Bash command you want to run

Optional inputs:

- `args`: A comma-separated list of arguments to run the command with
- `hide-warnings`: Whether to report warnings in the GitHub Actions logs
- `file`: The file to in which to record the output

Outputs:

- `output`: The command output (stdout + stderr)
- `duration`: The time the command took to run, in seconds

```
name: Capture output
on:
  workflow_dispatch:
jobs:
  capture-output:
    runs-on: ubuntu-latest
    steps:
      - name: Capture output
        uses: 'selfagency/capture-output@v1.0.1'
        with:
          cmd: yarn
          args: run,build,--verbose
          hide-warnings: true
          file: ${{ github.workspace }}/output.txt
```
