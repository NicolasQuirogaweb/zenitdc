import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    // Sin balance.ts (y su test) el proyecto no tiene ningún test por
    // ahora — que `vitest run` siga pasando en vez de fallar con "No
    // test files found".
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
    },
  },
})
