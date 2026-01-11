-- ============================================================================
-- BMA Digital Platform - Seed Data
-- Version: 1.0
-- Date: January 2026
-- Description: Initial seed data for development and testing
-- ============================================================================

-- Note: Run this AFTER the migrations and AFTER creating test users via Supabase Auth

-- ============================================================================
-- SAMPLE KNOWLEDGE BASE ENTRIES
-- ============================================================================

INSERT INTO knowledge_base (title, category, content_en, content_lus, source_url) VALUES

-- About BMA
('About Bangalore Mizo Association', 'about',
'Bangalore Mizo Association (BMA) is a community organization for Mizo people living in Bangalore, Karnataka. Founded to foster unity, preserve cultural heritage, and provide mutual support among the Mizo diaspora in the city.',
'Bangalore Mizo Association (BMA) hi Bangalore, Karnataka-a Mizo mi awmte tan bawlhpuina pawl a ni. Mizo culture humhalh nan leh inkawmna tha tak neih nan din a ni.',
NULL),

-- Membership FAQ
('Membership Information', 'faq',
'BMA offers two types of membership: Annual membership (₹300-350) valid for 12 months, and Lifetime membership (price TBD). Members get access to the member directory, full chatbot access, and can participate in all BMA events.',
'BMA membership hi Annual (₹300-350, kum 1 chhung) leh Lifetime (man a la puan lo) a awm. Member-te chuan member directory en thei, chatbot hmang kim thei, BMA hun hrang hrangah tel thei.',
NULL),

-- How to Join
('How to Become a Member', 'procedures',
'To become a BMA member: 1) Download the BMA app or visit our website, 2) Create an account with your email or social login, 3) Go to your profile and select "Become a Member", 4) Choose your membership tier, 5) Complete payment via UPI or other methods, 6) Your membership will be activated instantly after payment confirmation.',
'BMA member nih dan: 1) BMA app download rawh, 2) Account siamla email emaw social login hman rawh, 3) Profile-ah "Become a Member" thlang rawh, 4) Membership tier duh thlang rawh, 5) UPI hmangin payment pe rawh, 6) Payment a confirm hnu chuan membership a activate nghal ang.',
NULL),

-- Contact Information
('Contact BMA', 'procedures',
'For any queries or assistance, you can: 1) Use the Help Desk chatbot in the app, 2) Contact any of our committee members listed in the Leadership section, 3) Email us at bma.bangalore@example.com. For urgent matters, paid members can request escalation through the chatbot.',
'Zawhna emaw tanpuina atan: 1) App-a Help Desk chatbot hman rawh, 2) Leadership section-a committee member-te contact rawh, 3) bma.bangalore@example.com-ah email rawh. Urgent matter-ah chuan paid member-te chuan chatbot hmangin escalation request thei.',
NULL),

-- Events
('Annual Events', 'events',
'BMA organizes several annual events including: Chapchar Kut (spring festival) in March, Independence Day celebration in August, Christmas celebration in December, and regular monthly fellowship gatherings. All events are announced in the app and via WhatsApp.',
'BMA chuan kum tin hun pawimawh hrang hrang a buatsaih: Chapchar Kut (March), Independence Day (August), Christmas (December), leh thla tin fellowship. Hun te hi app-ah leh WhatsApp-ah puan a ni.',
NULL);

-- ============================================================================
-- SAMPLE CONTENT (for testing)
-- ============================================================================

-- Note: author_id should be set to an actual admin user ID after user creation
-- These will be inserted with a placeholder and should be updated

-- We'll leave content creation for after admin users are set up
-- This can be done via the admin dashboard

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
