const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

async function buildForRender() {
  try {
    console.log('Building for Render deployment...');

    // Backup original vite.config.ts
    const viteConfigPath = join(process.cwd(), 'vite.config.ts');
    const backupPath = viteConfigPath + '.backup';

    try {
      const viteConfig = readFileSync(viteConfigPath, 'utf8');
      writeFileSync(backupPath, viteConfig);

      // Modify vite.config.ts to disable Cloudflare plugins
      const modifiedConfig = viteConfig.replace(
        /config\.mode !== 'test' && remixCloudflareDevProxy\(\)/,
        'false' // Disable Cloudflare proxy
      );

      writeFileSync(viteConfigPath, modifiedConfig);
      console.log('Disabled Cloudflare plugins in vite.config.ts');
    } catch (error) {
      console.log('Could not modify vite.config.ts, proceeding anyway');
    }

    // Use the original Remix build command
    const env = {
      ...process.env,
      NODE_ENV: 'production'
    };

    console.log('Running: remix vite:build');

    // Execute the original Remix build command
    execSync('npx remix vite:build', {
      stdio: 'inherit',
      env: env,
      cwd: process.cwd()
    });

    // Restore original vite.config.ts
    try {
      if (require('fs').existsSync(backupPath)) {
        const originalConfig = readFileSync(backupPath, 'utf8');
        writeFileSync(viteConfigPath, originalConfig);
        require('fs').unlinkSync(backupPath);
        console.log('Restored original vite.config.ts');
      }
    } catch (error) {
      console.log('Could not restore vite.config.ts');
    }

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);

    // Try to restore config even on failure
    try {
      const backupPath = join(process.cwd(), 'vite.config.ts.backup');
      if (require('fs').existsSync(backupPath)) {
        const originalConfig = readFileSync(backupPath, 'utf8');
        writeFileSync(join(process.cwd(), 'vite.config.ts'), originalConfig);
        require('fs').unlinkSync(backupPath);
      }
    } catch (restoreError) {
      console.log('Could not restore vite.config.ts on failure');
    }

    process.exit(1);
  }
}

buildForRender();
