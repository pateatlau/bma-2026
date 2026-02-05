# Trunk-Based Development Migration Plan

**Date:** February 5, 2026
**Status:** Planning
**Target Completion:** Before Phase 1 starts

---

## Executive Summary

This document outlines the migration from the current Git Flow (with `main` and `develop` branches) to a **Trunk-Based Development** strategy using only the `main` branch as the trunk.

### Current State

- **Branches:** `main` (production) + `develop` (integration)
- **Workflow:** `feature` → `develop` → PR to `main` → deploy
- **Issues:** Extra merge step, dual branch maintenance, delayed integration

### Target State (Trunk-Based)

- **Branch:** `main` only (trunk)
- **Workflow:** `feature` → PR to `main` → CI/CD → E2E → Tag → Deploy
- **Benefits:** Faster integration, simpler workflow, better CI/CD

---

## Proposed Workflow

```plaintext
┌─────────────────────────────────────────────────────────────────────────┐
│                           TRUNK-BASED WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

Developer Workflow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Create feature branch from main
   git checkout main
   git pull origin main
   git checkout -b feature/new-feature

2. Make changes, commit often
   git add .
   git commit -m "feat: add new feature"
   (pre-commit hooks run: lint, format, typecheck)

3. Push feature branch
   git push origin feature/new-feature

4. Create Pull Request to main
   GitHub UI → New Pull Request → base: main

5. CI Pipeline runs (on PR)
   ✅ Lint & TypeScript check
   ✅ Unit tests
   ✅ Integration tests
   ✅ Build verification
   ❌ E2E tests (skipped on PR)

6. Code Review
   - Reviewer approves changes
   - All CI checks must pass
   - Branch must be up to date with main

7. Merge to main
   - Squash and merge (recommended)
   - Delete feature branch automatically

8. Post-Merge CI runs (on main)
   ✅ All checks from step 5
   ✅ E2E tests (Web only)
   ✅ Build artifacts

9. Release Workflow (manual trigger when ready)
   - Create release tag: v1.2.3
   - Tag push triggers:
     ✅ Full E2E suite (Web + Mobile)
     ✅ Production builds (Web, iOS, Android)
     ✅ Deployment to stores

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Visualization:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main (trunk, always deployable)
  │
  │   feature/user-auth (feature branch)
  │   ├── commit 1
  │   ├── commit 2
  │   └── commit 3
  │        │
  │        ├─► PR created
  │        │   ├─► CI runs (lint, test, build)
  │        │   ├─► Code review
  │        │   └─► Approved
  │        │
  ├────────┴─► Merge (squash) to main
  │
  │   [CI runs on main: all tests + E2E web]
  │
  │   feature/payment (another feature)
  │   ├── commit 1
  │   └── commit 2
  │        │
  ├────────┴─► Merge to main
  │
  │   [Ready for release]
  │
  ├─► Tag: v1.0.0
  │   ├─► Full E2E suite
  │   ├─► Production builds
  │   └─► Deploy to Web + App Stores
  │
  └─► Continue development...
```

---

## Migration Steps

### Step 1: Update CI/CD Workflows

Update all GitHub Actions workflows to remove `develop` branch triggers.

**Files to update:**

- `.github/workflows/ci.yml`
- `.github/workflows/build-web.yml`
- `.github/workflows/eas-build.yml`
- `.github/workflows/eas-release.yml` (if exists)

**Changes:**

```yaml
# BEFORE (current)
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# AFTER (trunk-based)
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  release:
    types: [published]
```

### Step 2: Update Branch Protection Rules

Configure GitHub branch protection for `main`:

**Settings → Branches → Branch protection rules → Add rule**

Pattern: `main`

Enable:

- ✅ Require a pull request before merging
  - ✅ Require approvals: 1
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional)
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Required checks:
    - `Lint & Type Check`
    - `Unit Tests`
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings
- ❌ Allow force pushes (keep disabled)
- ❌ Allow deletions (keep disabled)

### Step 3: Merge develop into main (one-time migration)

```bash
# Ensure both branches are up to date
git checkout main
git pull origin main

git checkout develop
git pull origin develop

# Merge develop into main
git checkout main
git merge develop

# Resolve any conflicts if needed
# Run tests to ensure everything works
npm run check
npm test

# Push to main
git push origin main
```

### Step 4: Archive develop branch

```bash
# Do NOT delete, but archive for history
# Create a tag to preserve the state
git tag archive/develop-final

# Push the tag
git push origin archive/develop-final

# Optional: Delete develop branch after confirming main is stable
# git push origin --delete develop
# git branch -d develop
```

**Recommendation:** Keep `develop` branch for 1-2 weeks after migration as a safety backup, then delete.

### Step 5: Update Documentation

Files to update:

- `README.md` - Update contributing section
- `docs/CI-CD-IMPLEMENTATION-PLAN.md` - Remove develop references
- `.github/PULL_REQUEST_TEMPLATE.md` - Update base branch to main
- `CLAUDE.md` - Update git workflow section

### Step 6: Team Communication

**Notify all developers:**

> **📢 Git Workflow Change: Trunk-Based Development**
>
> Effective immediately, we're switching to trunk-based development:
>
> - ✅ **Use `main` as the base for all feature branches**
> - ✅ **Create PRs directly to `main`**
> - ❌ **Do NOT use `develop` branch anymore**
>
> **New workflow:**
>
> 1. `git checkout main && git pull`
> 2. `git checkout -b feature/your-feature`
> 3. Make changes, commit, push
> 4. Create PR to `main`
> 5. After approval and CI pass → Merge
>
> **Why?** Faster integration, simpler workflow, better CI/CD efficiency.

---

## Updated CI/CD Pipeline Details

### PR Workflow (feature → main)

**Trigger:** Pull request opened/updated against `main`

**Jobs:**

1. **Lint & Type Check** (~2 min)
   - ESLint
   - TypeScript check
   - Prettier format check

2. **Unit Tests** (~5 min)
   - Run Jest unit tests
   - Generate coverage report
   - Upload to Codecov

3. **Integration Tests** (~5 min)
   - Run integration tests
   - API mocking with MSW

4. **Build Verification** (~3 min)
   - Build web bundle
   - Verify no build errors
   - Upload build artifacts

**Total:** ~15 minutes

**Result:**

- ✅ All checks pass → Ready for review
- ❌ Any check fails → Cannot merge

### Post-Merge Workflow (after merge to main)

**Trigger:** Push to `main` branch

**Jobs:**

1. **All PR checks** (repeat from above)
2. **E2E Tests - Web** (~10 min)
   - Run Playwright tests
   - Critical user flows only
   - Upload test reports

**Total:** ~25 minutes

**Result:**

- ✅ Success → `main` is stable, ready for release
- ❌ Failure → Alert team, investigate immediately

### Release Workflow (manual trigger or tag push)

**Trigger:**

- Manual: GitHub Actions → Run workflow → Select version
- Automatic: Push tag matching `v*` (e.g., `v1.2.0`)

**Jobs:**

1. **Full E2E Suite** (~30 min)
   - Web (Playwright)
   - Mobile (Maestro) - if configured

2. **Production Builds** (parallel, ~20 min each)
   - Web → Vercel
   - iOS → EAS → TestFlight
   - Android → EAS → Play Store Internal Track

3. **Deployment**
   - Web: Automatic via Vercel
   - Mobile: Submit to stores via EAS Submit

**Total:** ~50 minutes

---

## Workflow Files Structure

```plaintext
.github/workflows/
├── ci.yml                    # PR + main push: lint, test, build
├── e2e-web.yml              # main push: E2E web tests
├── release.yml              # Tag push: full E2E + builds
└── deploy-mobile.yml        # Manual: deploy to stores
```

### ci.yml (Core CI Pipeline)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage --ci
      - uses: codecov/codecov-action@v4
        if: always()
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration

  build-web:
    name: Build Web
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx expo export --platform web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/
```

### e2e-web.yml (E2E Tests on Main)

```yaml
name: E2E Tests (Web)

on:
  push:
    branches: [main]

jobs:
  e2e-web:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          CI: true
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### release.yml (Full Release Pipeline)

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (e.g., 1.2.0)'
        required: true

jobs:
  e2e-full:
    name: Full E2E Test Suite
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          CI: true

  build-web:
    name: Build & Deploy Web
    needs: e2e-full
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx expo export --platform web
      # Vercel deployment happens automatically via Vercel GitHub integration

  build-ios:
    name: Build iOS
    needs: e2e-full
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --platform ios --profile production --non-interactive

  build-android:
    name: Build Android
    needs: e2e-full
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --platform android --profile production --non-interactive
```

---

## Release Process

### Creating a Release

**Option 1: Git Tag (Recommended)**

```bash
# Ensure main is up to date and stable
git checkout main
git pull origin main

# Run tests locally
npm run check
npm test

# Create and push tag
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# This triggers the release workflow automatically
```

**Option 2: GitHub UI**

1. Go to: https://github.com/YOUR_USERNAME/BMA-2026/releases
2. Click "Draft a new release"
3. Click "Choose a tag" → Create new tag: `v1.2.0`
4. Target: `main`
5. Title: "Version 1.2.0"
6. Description: Release notes (auto-generated or manual)
7. Click "Publish release"

### Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Major (v2.0.0):** Breaking changes
- **Minor (v1.2.0):** New features, backward compatible
- **Patch (v1.1.1):** Bug fixes, backward compatible

**Examples:**

- Initial launch: `v1.0.0`
- New chatbot feature: `v1.1.0`
- Bug fix: `v1.1.1`
- Redesign with breaking changes: `v2.0.0`

---

## Hotfix Process

For critical production bugs that need immediate fix:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... make changes ...

# 3. Commit and push
git add .
git commit -m "fix: critical production bug"
git push origin hotfix/critical-bug

# 4. Create PR to main (expedited review)
# CI runs, get quick approval

# 5. Merge to main
# Post-merge CI runs

# 6. Create hotfix tag immediately
git checkout main
git pull origin main
git tag -a v1.1.1 -m "Hotfix: Critical bug"
git push origin v1.1.1

# 7. Release workflow deploys to production
```

---

## Benefits of Trunk-Based Development

### 1. **Faster Integration**

- No waiting for develop → main merge
- Continuous integration into main
- Smaller, more frequent merges

### 2. **Simpler Workflow**

- One branch to rule them all
- Less mental overhead
- Clearer CI/CD pipeline

### 3. **Better CI/CD**

- Every PR tests against production branch
- E2E tests run on actual deployment target
- Release process is streamlined

### 4. **Reduced Merge Conflicts**

- Frequent small merges vs. large batches
- Conflicts resolved early
- Less time in merge hell

### 5. **Always Deployable Main**

- Main branch is always in releasable state
- Can create release tag anytime
- Emergency hotfixes are faster

---

## Risks & Mitigations

### Risk 1: Broken Main Branch

**Mitigation:**

- ✅ Require PR reviews (1 minimum)
- ✅ Require all CI checks to pass
- ✅ Run E2E tests after merge to main
- ✅ Can revert commits easily
- ✅ Post-merge monitoring

### Risk 2: Incomplete Features in Production

**Mitigation:**

- ✅ Use feature flags for WIP features
- ✅ Keep features behind flags until complete
- ✅ Release when ready, not on every merge

### Risk 3: CI/CD Pipeline Becomes Bottleneck

**Mitigation:**

- ✅ Optimize test execution (parallel jobs)
- ✅ Skip E2E on PR (run on main only)
- ✅ Use concurrency groups (cancel in-progress)
- ✅ Cache dependencies aggressively

---

## Rollback Plan

If migration causes issues:

### Immediate Rollback (within 24 hours)

```bash
# Restore develop branch
git checkout develop
git pull origin develop

# Update workflows to include develop again
# Revert workflow file changes

# Communicate to team
```

### Gradual Rollback (after 24 hours)

- Keep trunk-based for new features
- Use `develop` branch tag as temporary branch
- Gradually transition back

**Recommendation:** Migration is low-risk. Test thoroughly before announcing to team.

---

## Timeline

| Phase       | Task                        | Duration |
| ----------- | --------------------------- | -------- |
| **Day 1**   | Update CI/CD workflows      | 1 hour   |
| **Day 1**   | Merge develop → main        | 30 min   |
| **Day 1**   | Configure branch protection | 15 min   |
| **Day 1**   | Update documentation        | 1 hour   |
| **Day 2**   | Team communication          | 15 min   |
| **Day 2**   | Monitor first PRs           | Ongoing  |
| **Day 3-7** | Stabilization period        | Ongoing  |
| **Day 14**  | Archive/delete develop      | 5 min    |

**Total Setup Time:** ~3 hours

---

## Checklist

### Pre-Migration

- [ ] Review current CI/CD workflows
- [ ] Ensure `main` branch is stable
- [ ] Ensure `develop` branch is merged to `main`
- [ ] Backup current workflow files

### Migration

- [ ] Update `.github/workflows/ci.yml`
- [ ] Update `.github/workflows/build-web.yml`
- [ ] Create `.github/workflows/e2e-web.yml`
- [ ] Create `.github/workflows/release.yml`
- [ ] Merge `develop` into `main`
- [ ] Configure branch protection on `main`
- [ ] Tag develop: `archive/develop-final`

### Post-Migration

- [ ] Update `README.md`
- [ ] Update `docs/CI-CD-IMPLEMENTATION-PLAN.md`
- [ ] Update `CLAUDE.md`
- [ ] Create team announcement
- [ ] Monitor first 5 PRs closely
- [ ] After 2 weeks: Delete `develop` branch

---

## Next Steps

1. **Review this plan** with the team
2. **Schedule migration** (recommended: before Phase 1 starts)
3. **Execute migration** (estimated 3 hours)
4. **Monitor & adjust** (first week)
5. **Full adoption** (ongoing)

---

## Questions & Answers

**Q: Can we still have long-running feature branches?**
A: Yes, but merge to `main` frequently (daily/weekly). Use feature flags to hide WIP.

**Q: What if a feature takes 2 weeks to complete?**
A: Break it into smaller PRs. Use feature flags. Merge incrementally.

**Q: What happens if someone accidentally pushes broken code to main?**
A: Branch protection prevents direct pushes. All changes go through PR + CI. If somehow broken code gets in, revert the commit immediately.

**Q: Do we lose the develop branch history?**
A: No. Tag it before deletion. History is preserved in Git.

**Q: Can we go back to develop branch if needed?**
A: Yes, within the first 2 weeks. After that, it's archived but not deleted.

---

## References

- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

**Status:** Ready for implementation
**Approved By:** Pending team review
**Next Action:** Execute migration steps
