# Capture Output Action

Capture the output (and duration) of a command as a GitHub Actions `output` or file

## How to use this Action

```
name: Capture output
on:
  workflow_dispatch:
jobs:
  capture-output:
    runs-on: ubuntu-latest
    steps:
      - name: Capture output
        uses: 'selfagency/capture-output@v1.0.0'
        with:
          hide-warnings: true
          file: '${{ github.workspace }}/output.txt'
          command: 'yarn'
          args: 'run,build,--verbose'
```