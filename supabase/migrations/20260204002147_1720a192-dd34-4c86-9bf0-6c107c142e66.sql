-- Add validation constraints to leads table to enforce server-side input validation
-- This prevents bypassing client-side validation via direct API calls

-- Validate full_name length (max 100 characters)
ALTER TABLE leads ADD CONSTRAINT check_full_name_length 
  CHECK (length(full_name) <= 100);

-- Validate email length (max 255 characters) and basic format
ALTER TABLE leads ADD CONSTRAINT check_email_length 
  CHECK (length(email) <= 255);
ALTER TABLE leads ADD CONSTRAINT check_email_format 
  CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Validate phone length (max 30 characters)
ALTER TABLE leads ADD CONSTRAINT check_phone_length 
  CHECK (phone IS NULL OR length(phone) <= 30);

-- Validate message length (max 2000 characters)
ALTER TABLE leads ADD CONSTRAINT check_message_length 
  CHECK (message IS NULL OR length(message) <= 2000);

-- Validate interested_areas array count (max 20 items)
ALTER TABLE leads ADD CONSTRAINT check_interested_areas_count 
  CHECK (interested_areas IS NULL OR array_length(interested_areas, 1) IS NULL OR array_length(interested_areas, 1) <= 20);

-- Validate notes length (max 5000 characters for internal notes)
ALTER TABLE leads ADD CONSTRAINT check_notes_length 
  CHECK (notes IS NULL OR length(notes) <= 5000);

-- Validate country_of_origin length (max 100 characters)
ALTER TABLE leads ADD CONSTRAINT check_country_length 
  CHECK (country_of_origin IS NULL OR length(country_of_origin) <= 100);

-- Validate interested_property_type length (max 50 characters)
ALTER TABLE leads ADD CONSTRAINT check_property_type_length 
  CHECK (interested_property_type IS NULL OR length(interested_property_type) <= 50);