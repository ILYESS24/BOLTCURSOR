const { execSync } = require('child_process');
const { join } = require('path');

async function buildForRender() {
  try {
    console.log('Building for Render deployment...');

    // Use the original Remix build command but with environment variables to disable Cloudflare
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      CF_PAGES: '0' // Disable Cloudflare workerd
    };

    console.log('Running: remix vite:build');

    // Execute the original Remix build command
    execSync('npx remix vite:build', {
      stdio: 'inherit',
      env: env,
      cwd: process.cwd()
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

buildForRender();
