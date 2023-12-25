import type { Options } from 'tsup';

export default <Options[]>[
  {
    entry: ['src/*.ts'],
    outDir: 'dist',
    format: ['cjs', 'esm'],
    clean: true,
    dts: true,
    onSuccess: 'npm run build:fix',
  },
  {
    entry: ['src/inspector/index.ts'],
    outDir: 'dist/inspector',
    outExtension: () => ({ js: '.js' }),
    format: ['iife'],
    clean: true,
    splitting: false,
    minify: true,
  },
];
