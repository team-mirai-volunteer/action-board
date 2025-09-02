# Cloudflare Pages Deployment Guide

This guide explains how to deploy the Action Board application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- A GitHub repository connected to Cloudflare Pages
- Supabase project with credentials

## Deployment Steps

### 1. Environment Variables Setup

Before deploying, you must configure the following environment variables in your Cloudflare Pages dashboard:

1. Go to your Cloudflare Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add variables for both **Production** and **Preview** environments

#### Required Variables (Minimum for build to succeed)

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

#### Recommended Variables (For full functionality)

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_ORIGIN` | Your app's URL | `https://action.team-hayama.jp` |
| `SITE_URL` | Site URL for redirects | `https://action.team-hayama.jp` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@sentry.io/xxx` |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Environment name | `production` or `preview` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` |

#### Optional Variables (Feature-specific)

| Variable Name | Description | Required For |
|--------------|-------------|--------------|
| `LINE_CLIENT_SECRET` | LINE Login channel secret | LINE authentication |
| `NEXT_PUBLIC_LINE_CLIENT_ID` | LINE Login channel ID | LINE authentication |
| `BATCH_ADMIN_KEY` | Admin key for batch APIs | Admin endpoints |
| `MAILGUN_API_KEY` | Mailgun API key | Email sending |
| `MAILGUN_DOMAIN` | Mailgun domain | Email sending |
| `HUBSPOT_API_KEY` | HubSpot API key | HubSpot integration |

### 2. Build Configuration

In your Cloudflare Pages project settings:

1. **Framework preset**: Select `Next.js`
2. **Build command**: `npm run build:pages`
3. **Build output directory**: `.vercel/output/static`
4. **Root directory**: `/` (or your repository root)

### 3. Deploy via GitHub

1. Push your changes to the connected GitHub repository
2. Cloudflare Pages will automatically trigger a build
3. Monitor the build logs in the Cloudflare dashboard

### 4. Verify Deployment

After deployment:

1. Check that the site loads correctly
2. Test authentication flows if configured
3. Verify that data is loading from Supabase
4. Check browser console for any errors

## Edge Runtime Configuration

All routes and API endpoints have been configured to use Edge Runtime for Cloudflare compatibility:
- API routes include `export const runtime = 'edge'`
- Dynamic pages include `export const runtime = 'edge'`
- Node.js-specific modules have been replaced with Edge-compatible alternatives

### Important Changes Made

1. **Crypto Module**: Replaced `node:crypto` with Web Crypto API
2. **File System**: Replaced file reads with inline templates
3. **Static Files**: Moved icon files from `app/` to `public/`

## Troubleshooting

### Build Failures

If the build fails with "Missing environment variable" errors:

1. Ensure all required variables are set in Cloudflare dashboard
2. Check that variable names match exactly (case-sensitive)
3. Try redeploying after adding variables

### Runtime Errors

If the site builds but shows errors when running:

1. Check browser console for specific error messages
2. Verify Supabase project is accessible
3. Check that CORS is configured correctly in Supabase

### Local Testing

To test the Cloudflare build locally:

```bash
# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL=your_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Run the Cloudflare build
npm run build:pages

# Test with Wrangler (Cloudflare's local dev tool)
npx wrangler pages dev .vercel/output/static
```

## Using the Environment Variable Template

A template file `.env.cloudflare` is provided with all variables. To use it:

1. Copy all variable names from `.env.cloudflare`
2. Add them to Cloudflare Pages dashboard
3. Fill in your actual values (don't use the placeholder values)

## Build Script Details

The `build:pages` script performs these steps:

1. Runs `check-env.js` to validate required environment variables
2. Sets `CLOUDFLARE_BUILD=true` to enable Cloudflare-specific Next.js configuration
3. Builds the Next.js application in static export mode

## Notes

- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Server-side only variables (without `NEXT_PUBLIC_`) are only available during build
- Changes to environment variables require a rebuild to take effect
- Use separate environment variables for Production and Preview environments

## Support

For issues specific to:
- Cloudflare Pages: Check [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)
- Next.js on Cloudflare: See [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- Supabase: Visit [Supabase docs](https://supabase.com/docs)