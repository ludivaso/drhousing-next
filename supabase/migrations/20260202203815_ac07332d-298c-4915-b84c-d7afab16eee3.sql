-- Fix storage bucket policies: restrict write access to admins only

-- Property Images: Drop permissive policies and create admin-only policies
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images' AND public.is_admin());

CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'property-images' AND public.is_admin());

CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'property-images' AND public.is_admin());

-- Agent Photos: Drop permissive policies and create admin-only policies
DROP POLICY IF EXISTS "Authenticated users can upload agent photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update agent photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete agent photos" ON storage.objects;

CREATE POLICY "Admins can upload agent photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'agent-photos' AND public.is_admin());

CREATE POLICY "Admins can update agent photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'agent-photos' AND public.is_admin());

CREATE POLICY "Admins can delete agent photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'agent-photos' AND public.is_admin());