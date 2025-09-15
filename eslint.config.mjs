import mantine from 'eslint-config-mantine';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  ...mantine,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      curly: ['error', 'multi'],
    },
  },
  { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}', './.storybook/main.ts'] },
  {
    files: ['**/*.story.tsx'],
    rules: {
      'no-console': 'off',
      curly: ['error', 'multi'],
    },
  }
);
