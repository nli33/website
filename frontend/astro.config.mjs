import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: [remarkGfm],
  },
});
