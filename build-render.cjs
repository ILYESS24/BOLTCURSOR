const { build } = require('vite');
const { join } = require('path');
const { existsSync } = require('fs');

async function buildForRender() {
  try {
    // Check if we have the right entry point
    const rootDir = process.cwd();
    const entryClient = join(rootDir, 'app', 'entry.client.tsx');
    const entryServer = join(rootDir, 'app', 'entry.server.tsx');
    const indexHtml = join(rootDir, 'index.html');

    console.log('Building for Render deployment...');
    console.log('Root directory:', rootDir);
    console.log('Entry client exists:', existsSync(entryClient));
    console.log('Entry server exists:', existsSync(entryServer));
    console.log('Index HTML exists:', existsSync(indexHtml));

    await build({
      configFile: false, // Use inline config to avoid Cloudflare plugins
      root: rootDir,
      mode: 'production',
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          input: indexHtml
        }
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.CF_PAGES': JSON.stringify('0') // Disable Cloudflare
      },
      plugins: [
        // Add minimal Remix-like plugins without Cloudflare
        {
          name: 'remix-stub',
          configureServer(server) {
            return () => {
              server.middlewares.use((req, res, next) => {
                if (req.url === '/') {
                  res.setHeader('content-type', 'text/html');
                  res.end('<html><body>Building...</body></html>');
                  return;
                }
                next();
              });
            };
          }
        }
      ]
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildForRender();
