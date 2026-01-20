# Action-Board: GCP → Vercel Migration Plan

## Summary

Your understanding is correct. The action-board codebase is **completely cloud-agnostic** - all GCP-specific configuration is in infrastructure files (Terraform, cloudbuild.yaml, Dockerfile), not in the application code. This makes migration straightforward.

## Environment Setup

| Branch | Environment | Supabase | Deploy Method |
|--------|-------------|----------|---------------|
| `main` | Production | Production project | GitHub Actions → Deploy Hook |
| `develop` | Staging | Staging project | GitHub Actions → Deploy Hook |
| PR branches | Preview | Staging project | Vercel auto-deploy (no migrations) |

**Smart auto-deploy approach:**
- **PRs/Previews**: Vercel auto-deploys (no migration needed - uses existing staging DB)
- **Staging/Production**: GitHub Actions runs migrations first, then triggers Vercel deploy

---

## Phase 1: Initial Vercel Deployment (Manual)

**Goal**: Get action-board running on `action-board-xxx.vercel.app`

### Steps:
1. **Connect repo to Vercel**
   - Import project at vercel.com/new
   - Select the action-board repository
   - Framework preset: Next.js (auto-detected)

2. **Configure environment variables in Vercel dashboard**
   Required variables (from `.env.example`):
   ```
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY

   # Auth
   LINE_CLIENT_SECRET
   NEXT_PUBLIC_LINE_CLIENT_ID

   # Monitoring
   NEXT_PUBLIC_SENTRY_DSN
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
   SENTRY_AUTH_TOKEN
   NEXT_PUBLIC_GA_ID

   # External Services
   MAILGUN_API_KEY
   MAILGUN_DOMAIN
   HUBSPOT_API_KEY
   HUBSPOT_CONTACT_LIST_ID

   # Batch/Admin
   BATCH_ADMIN_KEY

   # URLs (update for new domain)
   NEXT_PUBLIC_APP_ORIGIN=https://action-board-xxx.vercel.app
   SUPABASE_SITE_URL=https://action-board-xxx.vercel.app
   SITE_URL=https://action-board-xxx.vercel.app
   ```

3. **Remove standalone build flag** (optional)
   - Vercel doesn't need `output: "standalone"` - it's for Docker
   - Can leave as-is since it's conditional: `process.env.STANDALONE_BUILD ? "standalone" : undefined`

4. **Deploy**
   - Vercel will run `npm run build` and deploy
   - Should be accessible at `action-board-xxx.vercel.app`

### Potential Issues to Watch:
- **Supabase Auth redirects**: Update `ADDITIONAL_REDIRECT_URLS` in Supabase dashboard to include new Vercel URL
- **LINE Login**: Add new callback URL to LINE Developer Console
- **Sentry**: Update allowed domains if configured

---

## Phase 2: CI/CD Setup (GitHub Actions)

**Goal**: Automate deployments with DB migrations first, while keeping PR previews automatic

### Steps:

1. **Create Vercel Deploy Hooks** (2 hooks needed)
   - Vercel Dashboard → Project → Settings → Git → Deploy Hooks
   - Create hook for `main` branch → Production
   - Create hook for `develop` branch → Staging
   - Copy both webhook URLs

2. **Create GitHub environments**
   - Settings → Environments → New environment
   - Create `production` and `staging` environments
   - Add secrets per environment:

   **Staging environment secrets:**
   ```
   VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/... (staging hook)
   SUPABASE_ACCESS_TOKEN=...
   SUPABASE_PROJECT_REF=... (staging project)
   SUPABASE_DB_PASSWORD=... (staging password)
   NEXT_PUBLIC_SUPABASE_URL=... (staging URL)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=... (staging anon key)
   SUPABASE_SERVICE_ROLE_KEY=... (staging service role key)
   ```

   **Production environment secrets:**
   ```
   VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/... (production hook)
   SUPABASE_ACCESS_TOKEN=...
   SUPABASE_PROJECT_REF=... (production project)
   SUPABASE_DB_PASSWORD=... (production password)
   NEXT_PUBLIC_SUPABASE_URL=... (production URL)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=... (production anon key)
   SUPABASE_SERVICE_ROLE_KEY=... (production service role key)
   ```

3. **Create deployment workflow** (`.github/workflows/deploy.yml`)
   ```yaml
   name: Migrate DB then Deploy

   on:
     push:
       branches: [main, develop]

   jobs:
     migrate-and-deploy:
       runs-on: ubuntu-latest
       environment: ${{ github.ref_name == 'main' && 'production' || 'staging' }}
       steps:
         - uses: actions/checkout@v5

         - uses: supabase/setup-cli@v1
           with:
             version: latest

         - name: Link Supabase project
           run: supabase link --project-ref $SUPABASE_PROJECT_REF --password $SUPABASE_DB_PASSWORD
           env:
             SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
             SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
             SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}

         - name: Apply migrations
           run: |
             supabase db push --include-all
             supabase config push
           env:
             SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

         - uses: actions/setup-node@v4
           with:
             node-version: 22
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Sync mission data
           run: npm run mission:sync
           env:
             NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
             SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

         - name: Sync posting event data
           run: npm run posting:sync
           env:
             NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
             SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

         - name: Load poster data
           run: npm run poster:load-csv
           env:
             NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
             SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}

         - name: Trigger Vercel deployment
           run: curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK_URL }}"
   ```

4. **Configure Vercel for smart auto-deploy**

   Create `vercel.json` that **keeps PR previews enabled** but disables branch deploys:
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "git": {
       "deploymentEnabled": {
         "main": false,
         "develop": false
       }
     }
   }
   ```

   This means:
   - ✅ PR previews still work (auto-deploy to `*.vercel.app`)
   - ❌ Push to `main`/`develop` won't auto-deploy (GitHub Actions handles it)

5. **Configure Vercel environment variables per environment**
   - Project Settings → Environment Variables
   - Set Production variables for `Production` environment
   - Set Staging variables for `Preview` environment (used by PRs too)

---

## Phase 3: DNS Migration

**Goal**: Point production domain to Vercel

### Steps:
1. **Add custom domain in Vercel**
   - Project Settings → Domains → Add domain
   - Vercel will provide DNS records (A/CNAME)

2. **Update DNS records**
   - Point domain to Vercel's edge network
   - Vercel handles SSL automatically

3. **Update environment variables**
   - Change `NEXT_PUBLIC_APP_ORIGIN`, `SITE_URL`, etc. to production domain
   - Update Supabase auth redirect URLs
   - Update LINE Login callback URL

4. **Decommission GCP resources**
   - After confirming Vercel deployment is stable
   - Remove Cloud Run service, Cloud Build triggers
   - Archive Terraform state

---

## Files That Can Be Removed (After Migration)

These are GCP-specific and no longer needed on Vercel:
- `/terraform/` - entire directory
- `cloudbuild.yaml`
- `Dockerfile`

---

## Comparison: Current GCP vs Vercel

| Aspect | GCP (Current) | Vercel (Target) |
|--------|---------------|-----------------|
| Build | Cloud Build + Docker | Native Next.js |
| Runtime | Cloud Run (container) | Vercel Edge/Serverless |
| Secrets | Secret Manager | Vercel Environment Variables |
| CI/CD | cloudbuild.yaml | GitHub Actions + Deploy Hook |
| Infrastructure | Terraform | Managed by Vercel |
| Cost Model | Pay-per-use (Cloud Run) | Free tier + pay-per-use |

---

## Verification Checklist

After each phase:
- [ ] Homepage loads correctly
- [ ] User authentication works (sign up, login, LINE OAuth)
- [ ] Missions list and details render
- [ ] Map functionality works
- [ ] Ranking page loads
- [ ] API routes respond (test `/api/auth/callback`)
- [ ] Sentry captures errors
- [ ] Google Analytics tracking works
