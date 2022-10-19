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

```
name: Capture output
on:
  workflow_dispatch:
jobs:
  capture-output:
    runs-on: ubuntu-latest
    steps:
      - name: Capture output
        uses: 'selfagency/capture-output@v1'
        with:
          cmd: yarn
          args: run,build,--verbose
          hide-warnings: true
          fail: false
          file: ${{ github.workspace }}/output.txt
```
