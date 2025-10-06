import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import rawLoader from 'vite-raw-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    vue(),
    rawLoader({fileRegex: /\.(fs|vs)$/}),
  ],
});
