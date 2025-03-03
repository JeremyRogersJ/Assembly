import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@materials': path.resolve(__dirname, './src/materials'),
      '@geometries': path.resolve(__dirname, './src/geometries'),
      '@shaders': path.resolve(__dirname, './src/shaders'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts')
    }
  }
})