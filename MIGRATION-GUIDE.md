# Database Migration Guide

This guide will help you apply the database migrations to your Supabase project.

## Prerequisites

- ✅ Supabase project created (dxwwnvlgtymnaawgcofd.supabase.co)
- ✅ Environment variables configured in `.env`
- ✅ Storage buckets created in Supabase Dashboard
- ✅ Authentication providers enabled

## 🚀 Quick Start (Recommended)

### Step 1: Get Supabase Access Token

1. Visit: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Name it: "BMA Development"
4. Copy the token
5. Set it in your terminal:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

### Step 2: Run the automated setup script

```bash
./scripts/setup-database.sh
```

This script will:

- ✅ Link your Supabase project
- ✅ Apply all database migrations
- ✅ Generate TypeScript types

**That's it!** Jump to the [Verify Migrations](#verify-migrations) section to confirm everything worked.

---

## Alternative Options

### Option A: Manual CLI Commands

If you prefer to run commands individually:

```bash
# 1. Set your access token
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here

# 2. Link project
npm run supabase:link

# 3. Push migrations
npm run supabase:push

# 4. Generate types
npm run supabase:types
```

### Option B: Interactive Login (if you have a TTY terminal)

```bash
# 1. Login (opens browser)
npx supabase login

# 2. Link project
npm run supabase:link

# 3. Push migrations
npm run supabase:push

# 4. Generate types
npm run supabase:types
```

### Option C: Using Supabase Dashboard (SQL Editor)

If you prefer a manual approach or the CLI doesn't work:

### Step 1: Open SQL Editor

Go to: https://supabase.com/dashboard/project/dxwwnvlgtymnaawgcofd/sql/new

### Step 2: Run migrations manually

Copy and paste the contents of each migration file in order:

1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_rls_policies.sql`

Click "Run" after pasting each file.

### Step 3: Generate types manually

Get your types from:
https://supabase.com/dashboard/project/dxwwnvlgtymnaawgcofd/api/typescript

Copy the generated TypeScript code and save it to `lib/database.types.ts`.

## Option 3: Using Service Role Key (Automated)

If you want to automate the process (useful for CI/CD):

### Step 1: Get your service role key

Go to: https://supabase.com/dashboard/project/dxwwnvlgtymnaawgcofd/settings/api

Copy the `service_role` key (keep it secret!).

### Step 2: Set environment variable

```bash
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Run migration script

```bash
node scripts/apply-migrations.js
```

⚠️ **Important:** Never commit your service role key to git!

## Verify Migrations

After running migrations, verify the database setup:

### 1. Check Tables

Go to: https://supabase.com/dashboard/project/dxwwnvlgtymnaawgcofd/editor

You should see these tables:

- profiles
- memberships
- payments
- content
- comments
- likes
- knowledge_base
- chat_conversations
- chat_messages
- escalations
- daily_message_counts
- audit_logs
- notification_logs

### 2. Check RLS Policies

Go to: https://supabase.com/dashboard/project/dxwwnvlgtymnaawgcofd/auth/policies

Each table should have RLS enabled with multiple policies.

### 3. Test Database Connection

Run a simple test:

```bash
npm start
```

Then press `w` for web and navigate to any page. Check the browser console for any Supabase connection errors.

## Troubleshooting

### Error: "relation does not exist"

This means the migrations haven't been applied yet. Follow Option 1 or Option 2 above.

### Error: "permission denied for table"

This means RLS policies aren't working correctly. Make sure migration `00002_rls_policies.sql` was applied.

### Error: "Could not find module 'lib/database.types'"

Run `npm run supabase:types` to generate the TypeScript types.

### CLI authentication issues

If `npx supabase login` doesn't work:

1. Try using an access token instead: https://supabase.com/dashboard/account/tokens
2. Set it as: `export SUPABASE_ACCESS_TOKEN=your_token_here`
3. Then run the migration commands

## Next Steps

After migrations are complete:

1. ✅ Generate TypeScript types: `npm run supabase:types`
2. ✅ Test authentication flow in the app
3. ✅ Verify RLS policies are working
4. ✅ Proceed to Phase 1: Core Infrastructure

## Useful Commands

```bash
# Check migration status
npm run supabase:status

# Link to project
npm run supabase:link

# Push migrations
npm run supabase:push

# Generate types
npm run supabase:types

# Full setup (after authentication)
npm run supabase:link && npm run supabase:push && npm run supabase:types
```

## Support

If you encounter issues:

1. Check the Supabase Dashboard logs
2. Verify your `.env` file has correct credentials
3. Ensure you're authenticated with the Supabase CLI
4. Check the migration files for syntax errors

---

**Ready to proceed?** Run the migrations using Option 1 (recommended) and then continue with Phase 0 tasks!
