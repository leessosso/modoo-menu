import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 사용하지 않는 변수/import 허용 (개발 중에는 더 관대하게)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      // any 타입 허용
      '@typescript-eslint/no-explicit-any': 'off',
      // 개발 중에는 더 관대하게
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
])
