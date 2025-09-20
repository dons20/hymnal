import mantine from 'eslint-config-mantine';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  ...mantine,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      curly: ['error', 'multi-line'],
    },
  },
  { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}', './.storybook/main.ts'] },
  {
    files: ['**/*.story.tsx'],
  }
);
