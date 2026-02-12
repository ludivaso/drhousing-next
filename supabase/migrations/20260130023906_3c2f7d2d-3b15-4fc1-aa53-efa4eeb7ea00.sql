-- Create storage bucket for agent photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-photos', 'agent-photos', true);

-- Allow authenticated users to upload agent photos
CREATE POLICY "Authenticated users can upload agent photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-photos');

-- Allow authenticated users to update agent photos
CREATE POLICY "Authenticated users can update agent photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'agent-photos');

-- Allow authenticated users to delete agent photos
CREATE POLICY "Authenticated users can delete agent photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'agent-photos');

-- Allow public read access to agent photos
CREATE POLICY "Public can view agent photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'agent-photos');