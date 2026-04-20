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
import { z } from "zod";

export const Route = createFileRoute("/veranstaltungen/neu")({
  head: () => ({ meta: [{ title: "Event anlegen — Kulturrat" }] }),
  component: NewEventPage,
});

const schema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(4000).optional(),
  sparte: z.string(),
  start_at: z.string().min(1, "Datum erforderlich"),
  end_at: z.string().optional(),
  location: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  ticket_url: z.string().url().or(z.literal("")).optional(),
});

function NewEventPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sparte, setSparte] = useState("musik");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const parsed = schema.safeParse({
        title, description, sparte, start_at: startAt, end_at: endAt, location, city, ticket_url: ticketUrl,
      });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("events").upload(path, imageFile);
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from("events").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("events").insert({
        organizer_id: user.id,
        title, description: description || null, sparte: sparte as never,
        start_at: new Date(startAt).toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : null,
        location: location || null, city: city || null,
        ticket_url: ticketUrl || null,
        image_url: imageUrl,
      });
      if (error) throw error;
      toast.success("Veranstaltung angelegt");
      navigate({ to: "/veranstaltungen" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-6 py-16 flex-1 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Neu</div>
        <h1 className="font-serif text-5xl mb-2">Veranstaltung anlegen</h1>
        <p className="text-muted-foreground mb-10">Teile dein Event mit der Kulturszene.</p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="t">Titel *</Label>
            <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} />
          </div>
          <div>
            <Label>Sparte *</Label>
            <Select value={sparte} onValueChange={setSparte}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPARTEN.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="s">Beginn *</Label>
              <Input id="s" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="e">Ende</Label>
              <Input id="e" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loc">Veranstaltungsort</Label>
              <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} placeholder="z. B. Stadttheater" />
            </div>
            <div>
              <Label htmlFor="c">Stadt</Label>
              <Input id="c" value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} />
            </div>
          </div>
          <div>
            <Label htmlFor="d">Beschreibung</Label>
            <Textarea id="d" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} />
          </div>
          <div>
            <Label htmlFor="tu">Link / Ticket-URL</Label>
            <Input id="tu" type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="img">Bild</Label>
            <Input id="img" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button type="submit" disabled={busy} size="lg">
            {busy ? "Wird gespeichert..." : "Veranstaltung veröffentlichen"}
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
