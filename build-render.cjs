const { build } = require('vite');
const path = require('path');

async function buildForRender() {
  try {
    await build({
      configFile: false, // Don't use vite.config.ts
      root: process.cwd(),
      mode: 'production',
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html')
          }
        }
      },
      plugins: [
        // Minimal plugins without Cloudflare dependencies
      ],
      define: {
        'process.env.NODE_ENV': JSON.stringify('production')
      }
    });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildForRender();
