import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // 동적 Supabase 응답/스타일 캐스팅에 any를 실용적으로 사용
      '@typescript-eslint/no-explicit-any': 'off',
      // 상수/헬퍼를 컴포넌트 파일에 함께 두는 패턴 허용
      'react-refresh/only-export-components': 'off',
      // 데이터 fetch 후 setState 등 일반적 패턴까지 막는 신규 규칙 완화
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      // 미사용 변수는 경고로(언더스코어 접두사는 무시)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
