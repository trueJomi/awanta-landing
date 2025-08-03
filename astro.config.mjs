// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://awanta.app',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],
  compressHTML: true,

  build: {
    inlineStylesheets: 'auto'
  },

  adapter: vercel({
    isr: {
      exclude: [
        '/deudas',
        /^\/api\/.+/
      ]
    },
    webAnalytics: {
      enabled:true
    },
    maxDuration: 60,
  }),
});