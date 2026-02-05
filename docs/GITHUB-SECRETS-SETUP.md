# GitHub Secrets Setup Guide

**Status:** ✅ **COMPLETED** - Required secrets have been added

This guide explains how to configure GitHub repository secrets for CI/CD pipelines.

## Overview

GitHub Actions workflows require certain secrets to:

- Build the application with Supabase credentials
- Deploy to production/staging environments
- Upload test coverage reports
- Build and submit mobile apps via EAS

## Required Secrets

### 1. Supabase Credentials (Required)

These are needed for building the app and running tests.

**Secrets to add:**

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Where to find them:**

- Go to: https://supabase.com/dashboard/project/dxwwnvlgtymnaawgcofd/settings/api
- Copy **Project URL** → Set as `EXPO_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → Set as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Your values:**

```
EXPO_PUBLIC_SUPABASE_URL=https://dxwwnvlgtymnaawgcofd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4d3dudmxndHltbmFhd2djb2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTcwMDEsImV4cCI6MjA4MzU5MzAwMX0.06yOSMDyGRSMWgdImWNFo7hzM2-4w8C6ggmOtyyZ0vI
```

### 2. Codecov Token (Optional - for test coverage)

Only needed if you want to track test coverage.

**Secret to add:**

- `CODECOV_TOKEN`

**Where to get it:**

1. Sign up at: https://codecov.io
2. Add your GitHub repository
3. Copy the upload token

**Note:** The workflow has `fail_ci_if_error: false`, so builds won't fail if this is missing.

### 3. EAS/Expo Token (Optional - for mobile builds)

Only needed when you're ready to build mobile apps.

**Secret to add:**

- `EXPO_TOKEN`

**Where to get it:**

1. Sign up at: https://expo.dev
2. Go to: https://expo.dev/accounts/[your-account]/settings/access-tokens
3. Create a new token
4. Copy and save it

### 4. Vercel Deployment (Optional - for web deployment)

Only needed if you want automated web deployments.

**Secrets to add:**

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Where to get them:**

1. Sign up at: https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel link` in your project
4. Get org/project IDs from `.vercel/project.json`
5. Create token at: https://vercel.com/account/tokens

---

## How to Add Secrets to GitHub

### Step 1: Go to Repository Settings

Navigate to your repository on GitHub:

```
https://github.com/YOUR_USERNAME/BMA-2026/settings/secrets/actions
```

Or manually:

1. Go to your repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**

### Step 2: Add New Repository Secret

1. Click **New repository secret**
2. Enter **Name** (e.g., `EXPO_PUBLIC_SUPABASE_URL`)
3. Enter **Secret** (the actual value)
4. Click **Add secret**

### Step 3: Repeat for Each Secret

Add all required secrets following the format above.

---

## Quick Setup Script

You can add the required Supabase secrets with these values:

| Name                            | Value                                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`      | `https://dxwwnvlgtymnaawgcofd.supabase.co`                                                                                                                                                                         |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4d3dudmxndHltbmFhd2djb2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTcwMDEsImV4cCI6MjA4MzU5MzAwMX0.06yOSMDyGRSMWgdImWNFo7hzM2-4w8C6ggmOtyyZ0vI` |

---

## Verification

After adding secrets, you can verify they work by:

1. **Triggering a workflow:**
   - Push a commit to `develop` or `main` branch
   - Or create a Pull Request

2. **Check workflow runs:**
   - Go to: https://github.com/YOUR_USERNAME/BMA-2026/actions
   - Click on the latest workflow run
   - Check that the build succeeds

3. **Common issues:**
   - **Secret not found:** Make sure the secret name matches exactly (case-sensitive)
   - **Invalid credentials:** Double-check the Supabase URL and anon key
   - **Build fails:** Check the workflow logs for specific error messages

---

## Secrets Priority Guide

Add secrets in this order based on your current needs:

### ✅ Phase 0 (Current Phase) - REQUIRED NOW

- `EXPO_PUBLIC_SUPABASE_URL` ✅ **Add immediately**
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` ✅ **Add immediately**

### Phase 1-2 (Optional for now)

- `CODECOV_TOKEN` - Can add when you start writing tests

### Phase 6 (Before Launch)

- `EXPO_TOKEN` - Add when building mobile apps for TestFlight/Play Store
- `VERCEL_TOKEN` - Add when deploying web to production
- `VERCEL_ORG_ID` - Add when deploying web to production
- `VERCEL_PROJECT_ID` - Add when deploying web to production

---

## Security Best Practices

1. **Never commit secrets to git**
   - Secrets should only be in GitHub Secrets or `.env` (which is gitignored)
   - Never hardcode API keys in source code

2. **Rotate secrets regularly**
   - Update Supabase anon key if you suspect it's compromised
   - Regenerate Expo/Vercel tokens periodically

3. **Use minimal permissions**
   - Use `anon` key (public) for client-side, not `service_role` (secret)
   - Service role key should only be used in secure Edge Functions

4. **Monitor usage**
   - Check Supabase Dashboard → Logs for unusual activity
   - Review GitHub Actions logs for failed authentication attempts

---

## Next Steps

After adding the required secrets:

1. ✅ Verify CI pipeline runs successfully
2. ✅ Test the app locally: `npm start`
3. ✅ Proceed to Phase 1: Core Infrastructure

## Support

If you encounter issues:

- Check GitHub Actions logs
- Verify secret names match exactly
- Ensure secrets don't have leading/trailing spaces
- Check Supabase Dashboard for API key validity

---

**Ready?** Add the two required Supabase secrets to your GitHub repository and you're good to go!
