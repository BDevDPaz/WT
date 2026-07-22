module.exports = {
  extends: ['expo'],
  ignorePatterns: [
    '/dist/*', 
    '/.expo/*', 
    '/node_modules/*'
  ],
  rules: {
    // Asegura que los hooks de React (useEffect, useCallback) tengan sus dependencias completas
    'react-hooks/exhaustive-deps': 'warn',
    
    // Desactivamos la regla base de variables no usadas a favor del compilador de TypeScript
    'no-unused-vars': 'off',
    
    // Permitir variables que empiecen con guion bajo (ej. _req) sin marcar error de desuso
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ]
  }
};
