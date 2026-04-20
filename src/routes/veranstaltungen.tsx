import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { SPARTEN, sparteLabel } from "@/lib/sparten";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

export const Route = createFileRoute("/veranstaltungen")({
  head: () => ({
    meta: [
      { title: "Veranstaltungen — Kulturrat" },
      { name: "description", content: "Aktuelle Veranstaltungen der Kulturszene entdecken." },
    ],
  }),
  component: EventsPage,
});

interface Ev {
  id: string;
  title: string;
  description: string | null;
  sparte: string;
  start_at: string;
  city: string | null;
  location: string | null;
  image_url: string | null;
  ticket_url: string | null;
  organizer_id: string;
}

function EventsPage() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase
      .from("events")
      .select("*")
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true });
    if (filter !== "all") {
      // @ts-expect-error narrow at runtime
      q = q.eq("sparte", filter);
    }
    q.then(({ data }) => {
      setEvents((data ?? []) as Ev[]);
      setLoading(false);
    });
  }, [filter]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-6 py-16 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Programm</div>
            <h1 className="font-serif text-5xl md:text-6xl">Veranstaltungen</h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Konzerte, Lesungen, Ausstellungen und mehr — kuratiert von unseren Mitgliedern.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Sparten</SelectItem>
                {SPARTEN.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="/veranstaltungen/neu">+ Event anlegen</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Lädt…</p>
        ) : events.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl">Keine Veranstaltungen</p>
            <p className="text-muted-foreground mt-2">Es sind noch keine Events in dieser Sparte angelegt.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {events.map((e) => (
              <article key={e.id} className="grid md:grid-cols-12 gap-8 border-b border-border pb-12">
                <div className="md:col-span-5">
                  {e.image_url ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={e.image_url} alt={e.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <span className="font-serif text-3xl text-muted-foreground/50">{sparteLabel(e.sparte)}</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-7 flex flex-col justify-center">
                  <div className="flex gap-3 items-center text-xs uppercase tracking-widest text-accent">
                    <span>{sparteLabel(e.sparte)}</span>
                    <span className="editorial-rule flex-1" />
                    <span className="text-muted-foreground">
                      {new Date(e.start_at).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl mt-3">{e.title}</h2>
                  {(e.location || e.city) && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {[e.location, e.city].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {e.description && <p className="mt-4 text-foreground/80 leading-relaxed">{e.description}</p>}
                  {e.ticket_url && (
                    <div className="mt-5">
                      <Button asChild variant="outline">
                        <a href={e.ticket_url} target="_blank" rel="noreferrer">Mehr erfahren</a>
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
