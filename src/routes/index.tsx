import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import heroImg from "@/assets/hero.jpg";
import aboutImg from "@/assets/about-conversation.jpg";
import { sparteLabel } from "@/lib/sparten";

export const Route = createFileRoute("/")({
  component: Index,
});

interface EventRow {
  id: string;
  title: string;
  start_at: string;
  city: string | null;
  sparte: string;
  image_url: string | null;
}

function Index() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,start_at,city,sparte,image_url")
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true })
      .limit(3)
      .then(({ data }) => setEvents((data ?? []) as EventRow[]));
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => setMemberCount(count ?? 0));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-12 gap-10 px-6 pt-16 pb-24">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
              Plattform · Kulturrat
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-balance">
              Eine Bühne für{" "}
              <em className="text-accent not-italic font-medium">Kultur­schaffende</em>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Werde Mitglied, präsentiere dein Schaffen und mache deine Veranstaltungen für die
              Kulturszene sichtbar.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/auth">Mitglied werden</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/veranstaltungen">Veranstaltungen entdecken</Link>
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-md">
              <Stat n={memberCount} label="Mitglieder" />
              <Stat n={events.length} label="Kommende Events" />
              <Stat n={10} label="Sparten" />
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-sm">
              <img
                src={heroImg}
                alt="Kulturschaffende auf der Bühne"
                width={1600}
                height={1100}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block bg-background border border-border p-6 max-w-xs">
              <div className="text-xs uppercase tracking-widest text-accent">Edition Nr. 01</div>
              <p className="font-serif text-xl mt-2 leading-snug">
                „Kultur lebt von denen, die sie machen.“
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFEST / STATS */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Auftrag</div>
            <p className="font-serif text-3xl md:text-5xl leading-[1.15] text-balance">
              Von Nachwuchstalenten bis zu etablierten Stimmen — der Kulturrat schafft{" "}
              <span className="text-muted-foreground">
                Sichtbarkeit, Vernetzung und Räume, in denen Kultur entstehen darf.
              </span>
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] overflow-hidden rounded-sm">
              <img
                src={aboutImg}
                alt="Zwei Kulturschaffende im Gespräch"
                width={1280}
                height={896}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 mt-20">
          {[
            { n: "10+", label: "Sparten vertreten" },
            { n: `${memberCount}+`, label: "Mitglieder" },
            { n: "500+", label: "Veranstaltungen jährlich" },
            { n: "365", label: "Tage Kultur" },
          ].map((s) => (
            <div key={s.label}>
              <div className="border-t border-border pt-6">
                <div className="font-serif text-5xl md:text-6xl tracking-tight">{s.n}</div>
                <div className="text-sm text-muted-foreground mt-3">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Programm</div>
            <h2 className="font-serif text-4xl md:text-5xl">Kommende Veranstaltungen</h2>
          </div>
          <Link
            to="/veranstaltungen"
            className="text-sm uppercase tracking-widest hover:text-accent"
          >
            Alle ansehen →
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="font-serif text-2xl mb-2">Noch keine Veranstaltungen</p>
            <p className="text-sm">Sei das erste Mitglied, das ein Event anlegt.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {events.map((e) => (
              <Link
                key={e.id}
                to="/veranstaltungen"
                className="group block border-b border-border pb-6"
              >
                {e.image_url && (
                  <div className="aspect-[4/3] overflow-hidden mb-4">
                    <img
                      src={e.image_url}
                      alt={e.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="text-xs uppercase tracking-widest text-accent">
                  {sparteLabel(e.sparte)}
                </div>
                <h3 className="font-serif text-2xl mt-2 group-hover:text-accent transition-colors">
                  {e.title}
                </h3>
                <div className="text-sm text-muted-foreground mt-2">
                  {new Date(e.start_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  {e.city && ` · ${e.city}`}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <h2 className="font-serif text-4xl md:text-5xl text-balance">
            Bereit, Teil der Kulturszene zu werden?
          </h2>
          <div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Eine Anmeldung genügt. Lege dein Profil an, präsentiere dein Schaffen und veröffentliche
              deine Veranstaltungen.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Jetzt Mitglied werden</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-serif text-4xl">{n}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
