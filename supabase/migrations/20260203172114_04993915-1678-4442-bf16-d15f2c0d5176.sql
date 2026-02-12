-- Step 1: Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'listing_editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';