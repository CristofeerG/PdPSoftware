import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // El patron "setCargando(true)/setError(null) al inicio del efecto" que
      // usan las paginas de reportes para refetch en cambios de filtro es el
      // patron recomendado por la doc de React (con flag de cleanup). La
      // regla es nueva en eslint-plugin-react-hooks v7 y lo marca como error;
      // se deja en warn en vez de reescribir esas paginas.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
)
