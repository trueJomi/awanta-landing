// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://awanta.app',
  output: "server",

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],
  compressHTML: true,

  build: {
    inlineStylesheets: 'auto'
  },

  adapter: node({
    mode: 'standalone'
  })
});