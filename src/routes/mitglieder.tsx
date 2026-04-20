import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { SPARTEN, sparteLabel } from "@/lib/sparten";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/mitglieder")({
  head: () => ({
    meta: [
      { title: "Mitglieder — Kulturrat" },
      { name: "description", content: "Verzeichnis der Kulturschaffenden im Kulturrat." },
    ],
  }),
  component: MembersPage,
});

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  sparte: string;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  region: string | null;
  website: string | null;
  instagram: string | null;
}

function MembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProfiles((data ?? []) as Profile[]));
  }, []);

  const filtered = profiles.filter((p) => {
    if (filter !== "all" && p.sparte !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-6 py-16 flex-1">
        <div className="border-b border-border pb-8 mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Verzeichnis</div>
          <h1 className="font-serif text-5xl md:text-6xl">Mitglieder</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Die Stimmen, Hände und Köpfe hinter unserer Kulturszene.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <Input
            placeholder="Name oder Stadt suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-sm"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Sparten</SelectItem>
              {SPARTEN.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground font-serif text-2xl">
            Keine Mitglieder gefunden.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => (
              <article key={p.id} className="border border-border p-6 bg-card">
                <div className="flex items-start gap-4">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center font-serif text-xl">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-accent">
                      {sparteLabel(p.sparte)}
                    </div>
                    <h3 className="font-serif text-2xl leading-tight">
                      {p.first_name} {p.last_name}
                    </h3>
                    {(p.city || p.region) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {[p.city, p.region].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
                {p.bio && <p className="text-sm text-foreground/80 mt-4 line-clamp-4">{p.bio}</p>}
                {(p.website || p.instagram) && (
                  <div className="mt-4 flex gap-3 text-xs uppercase tracking-widest">
                    {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">Website</a>}
                    {p.instagram && <a href={`https://instagram.com/${p.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">Instagram</a>}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
