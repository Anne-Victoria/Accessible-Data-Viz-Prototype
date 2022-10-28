import { resolve } from 'path';
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        populationByAge: resolve(__dirname, 'src/population-by-age/index.html'),
        populationByAgeTable: resolve(
          __dirname,
          'src/population-by-age/table.html'
        ),
        birthDeathRate: resolve(__dirname, 'src/birth-death-rates/index.html'),
        birthDeathRateTable: resolve(
          __dirname,
          'src/birth-death-rates/table.html'
        ),
      },
    },
  },
});
