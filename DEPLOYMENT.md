# Deployment Guide

This guide covers various deployment options for the AI Assistant application.

## Prerequisites

- Node.js 18.18.0 or higher
- pnpm 9.4.0 or higher
- Cloudflare account (for Pages deployment)
- Docker (for containerized deployment)

## Local Development

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development server:**

   ```bash
   pnpm dev
   ```

3. **Run tests:**

   ```bash
   pnpm test
   ```

4. **Run linting:**

   ```bash
   pnpm lint
   ```

5. **Type checking:**
   ```bash
   pnpm typecheck
   ```

## CI/CD Pipeline

The project includes GitHub Actions workflows for:

- **CI Pipeline** (`.github/workflows/ci.yml`):

  - Runs on push/PR to main/develop branches
  - Executes tests, linting, type checking, and security audit
  - Builds the application
  - Deploys to Cloudflare Pages (main branch only)

- **Security Scan** (`.github/workflows/security.yml`):
  - Runs weekly security audits
  - Checks for known vulnerabilities
  - Uploads audit results as artifacts

## Deployment Options

### 1. Cloudflare Pages (Recommended)

**Automatic Deployment:**

- Push to main branch triggers automatic deployment
- Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets

**Manual Deployment:**

```bash
pnpm build
pnpm deploy
```

### 2. Docker Deployment

**Build Docker image:**

```bash
pnpm docker:build
```

**Run container:**

```bash
pnpm docker:run
```

**Custom Docker deployment:**

```bash
docker build -t bolt-new .
docker run -p 8788:8788 -e NODE_ENV=production bolt-new
```

### 3. Traditional Server Deployment

1. **Build the application:**

   ```bash
   pnpm build
   ```

2. **Start the server:**
   ```bash
   pnpm start
   ```

## Environment Variables

Required environment variables for production:

- `ANTHROPIC_API_KEY`: Anthropic API key for AI functionality
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token (for deployment)
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID (for deployment)

## Security Considerations

- All dependencies are regularly audited for vulnerabilities
- Security scans run automatically via GitHub Actions
- Dependabot automatically creates PRs for dependency updates
- Critical vulnerabilities are resolved via package resolutions

## Monitoring and Maintenance

- Monitor GitHub Actions for failed builds
- Review security audit results weekly
- Update dependencies regularly via Dependabot PRs
- Monitor application performance and error rates

## Troubleshooting

**Build failures:**

- Check Node.js version compatibility
- Ensure all dependencies are installed
- Run `pnpm clean` and reinstall dependencies

**Security issues:**

- Run `pnpm audit` to check for vulnerabilities
- Update vulnerable packages or add resolutions
- Review security scan results in GitHub Actions

**Deployment issues:**

- Verify Cloudflare credentials
- Check build logs in GitHub Actions
- Ensure all required environment variables are set
