#!/bin/bash

# =============================================================================
# BMA 2026 - Database Setup Script
# =============================================================================
# This script helps you set up the database by running migrations and
# generating TypeScript types.
# =============================================================================

set -e  # Exit on error

echo ""
echo "🚀 BMA 2026 - Database Setup"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_ACCESS_TOKEN not found${NC}"
    echo ""
    echo "To use this script, you need a Supabase access token."
    echo ""
    echo "Option 1: Get an access token (recommended for automation)"
    echo "  1. Visit: https://supabase.com/dashboard/account/tokens"
    echo "  2. Create a new token (name it 'BMA Development')"
    echo "  3. Copy the token and run:"
    echo "     ${GREEN}export SUPABASE_ACCESS_TOKEN=your_token_here${NC}"
    echo "     ${GREEN}./scripts/setup-database.sh${NC}"
    echo ""
    echo "Option 2: Use interactive login"
    echo "  1. Run: ${GREEN}npx supabase login${NC}"
    echo "  2. Then run: ${GREEN}npm run supabase:link${NC}"
    echo "  3. Then run: ${GREEN}npm run supabase:push${NC}"
    echo "  4. Finally: ${GREEN}npm run supabase:types${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Access token found${NC}"
echo ""

# Verify SUPABASE_PROJECT_REF is set
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo -e "${RED}❌ Error: SUPABASE_PROJECT_REF environment variable not set${NC}"
    echo ""
    echo "Please add SUPABASE_PROJECT_REF to your .env file:"
    echo "  SUPABASE_PROJECT_REF=your-project-ref"
    echo ""
    echo "You can find it in Supabase Dashboard > Project Settings > General > Reference ID"
    exit 1
fi

# Step 1: Link project
echo -e "${BLUE}📍 Step 1/3: Linking to Supabase project...${NC}"
if npx supabase link --project-ref "$SUPABASE_PROJECT_REF"; then
    echo -e "${GREEN}✅ Project linked successfully${NC}"
else
    echo -e "${RED}❌ Failed to link project${NC}"
    exit 1
fi
echo ""

# Step 2: Push migrations
echo -e "${BLUE}📤 Step 2/3: Pushing migrations to database...${NC}"
if npx supabase db push; then
    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
else
    echo -e "${RED}❌ Failed to apply migrations${NC}"
    exit 1
fi
echo ""

# Step 3: Generate TypeScript types
echo -e "${BLUE}🔧 Step 3/3: Generating TypeScript types...${NC}"
if npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > lib/database.types.ts; then
    echo -e "${GREEN}✅ TypeScript types generated: lib/database.types.ts${NC}"
else
    echo -e "${RED}❌ Failed to generate types${NC}"
    exit 1
fi
echo ""

echo "=============================================="
echo -e "${GREEN}✨ Database setup complete!${NC}"
echo "=============================================="
echo ""
echo "📋 Next steps:"
echo "  1. Verify tables in Supabase Dashboard:"
echo "     https://supabase.com/dashboard/project/dxwwnvlgtymnaawgcofd/editor"
echo ""
echo "  2. Test the connection:"
echo "     ${GREEN}npm start${NC}"
echo ""
echo "  3. Continue with Phase 0 tasks"
echo ""
