DROP POLICY IF EXISTS "Avatars öffentlich lesbar" ON storage.objects;
DROP POLICY IF EXISTS "Eventbilder öffentlich lesbar" ON storage.objects;

CREATE POLICY "Avatar-Listing nur für Eigentümer" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Event-Listing nur für Eigentümer" ON storage.objects FOR SELECT USING (
  bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]
);