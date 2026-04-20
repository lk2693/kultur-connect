
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.kunst_sparte AS ENUM ('musik','theater','tanz','bildende_kunst','literatur','film','fotografie','performance','medienkunst','sonstiges');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  sparte public.kunst_sparte NOT NULL DEFAULT 'sonstiges',
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  instagram TEXT,
  public_email TEXT,
  city TEXT,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile öffentlich lesbar" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Eigenes Profil einfügen" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Eigenes Profil ändern" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Rollen öffentlich lesbar" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins können Rollen verwalten" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sparte public.kunst_sparte NOT NULL DEFAULT 'sonstiges',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  city TEXT,
  image_url TEXT,
  ticket_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events öffentlich lesbar" ON public.events FOR SELECT USING (true);
CREATE POLICY "Angemeldete User dürfen Events anlegen" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Veranstalter oder Admin dürfen ändern" ON public.events FOR UPDATE USING (auth.uid() = organizer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Veranstalter oder Admin dürfen löschen" ON public.events FOR DELETE USING (auth.uid() = organizer_id OR public.has_role(auth.uid(),'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, sparte)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'sparte')::public.kunst_sparte, 'sonstiges')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars','avatars',true), ('events','events',true);

CREATE POLICY "Avatars öffentlich lesbar" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "User lädt eigenen Avatar hoch" ON storage.objects FOR INSERT WITH CHECK (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User aktualisiert eigenen Avatar" ON storage.objects FOR UPDATE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User löscht eigenen Avatar" ON storage.objects FOR DELETE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Eventbilder öffentlich lesbar" ON storage.objects FOR SELECT USING (bucket_id = 'events');
CREATE POLICY "User lädt eigenes Eventbild hoch" ON storage.objects FOR INSERT WITH CHECK (bucket_id='events' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User aktualisiert eigenes Eventbild" ON storage.objects FOR UPDATE USING (bucket_id='events' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "User löscht eigenes Eventbild" ON storage.objects FOR DELETE USING (bucket_id='events' AND auth.uid()::text = (storage.foldername(name))[1]);
