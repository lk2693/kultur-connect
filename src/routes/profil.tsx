import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { SPARTEN } from "@/lib/sparten";
import { toast } from "sonner";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Mein Profil — Kulturrat" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", sparte: "musik", bio: "",
    avatar_url: "", website: "", instagram: "", public_email: "", city: "", region: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          sparte: data.sparte ?? "musik",
          bio: data.bio ?? "",
          avatar_url: data.avatar_url ?? "",
          website: data.website ?? "",
          instagram: data.instagram ?? "",
          public_email: data.public_email ?? "",
          city: data.city ?? "",
          region: data.region ?? "",
        });
      }
    });
  }, [user]);

  const upload = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl + `?v=${Date.now()}`;
    setForm((f) => ({ ...f, avatar_url: url }));
    toast.success("Foto hochgeladen");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").update({
        first_name: form.first_name,
        last_name: form.last_name,
        sparte: form.sparte as never,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        website: form.website || null,
        instagram: form.instagram || null,
        public_email: form.public_email || null,
        city: form.city || null,
        region: form.region || null,
      }).eq("id", user.id);
      if (error) throw error;
      toast.success("Profil aktualisiert");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-6 py-16 flex-1 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Profil</div>
        <h1 className="font-serif text-5xl mb-2">Mein Profil</h1>
        <p className="text-muted-foreground mb-10">
          Wie du im Mitgliederverzeichnis erscheinst.
        </p>

        <form onSubmit={save} className="space-y-5">
          <div className="flex items-center gap-6">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="" className="h-24 w-24 rounded-full object-cover border border-border" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted" />
            )}
            <div>
              <Label htmlFor="av">Profilbild</Label>
              <Input id="av" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Vorname</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            </div>
            <div>
              <Label>Nachname</Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label>Sparte</Label>
            <Select value={form.sparte} onValueChange={(v) => setForm({ ...form, sparte: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPARTEN.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Kurzbio</Label>
            <Textarea rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={1000} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Stadt</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>Region</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Website</Label><Input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Instagram</Label><Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@..." /></div>
          </div>

          <div>
            <Label>Öffentliche E-Mail</Label>
            <Input type="email" value={form.public_email} onChange={(e) => setForm({ ...form, public_email: e.target.value })} />
          </div>

          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "Speichern..." : "Profil speichern"}
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
