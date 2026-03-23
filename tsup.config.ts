import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/action.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  dts: false,
  sourcemap: false,
  outDir: 'dist',
  // Bundle all dependencies into the single output file so the action
  // works without node_modules on the runner.
  noExternal: [/.*/],
});
