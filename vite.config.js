import { resolve } from 'path';
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        population: resolve(__dirname, 'src/population.html'),
        populationTable: resolve(__dirname, 'src/population-table.html'),
      },
    },
  },
});
