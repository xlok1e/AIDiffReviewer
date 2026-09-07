import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: ['out/**', '.next/**', 'src-tauri/target/**'],
  },
];

export default eslintConfig;
