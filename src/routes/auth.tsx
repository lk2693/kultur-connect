import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { SPARTEN } from "@/lib/sparten";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Anmelden — Kulturrat" },
      { name: "description", content: "Mitglied werden oder anmelden beim Kulturrat." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  email: z.string().email("Ungültige E-Mail").max(255),
  password: z.string().min(8, "Mindestens 8 Zeichen").max(72),
  first_name: z.string().min(1, "Vorname erforderlich").max(80),
  last_name: z.string().min(1, "Nachname erforderlich").max(80),
  sparte: z.string().min(1),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sparte, setSparte] = useState("musik");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/profil" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ email, password, first_name: firstName, last_name: lastName, sparte });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/profil`,
            data: { first_name: firstName, last_name: lastName, sparte },
          },
        });
        if (error) throw error;
        toast.success("Willkommen! Dein Account wurde erstellt.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Angemeldet");
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Fehler";
      toast.error(m.includes("already registered") ? "E-Mail bereits registriert" : m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-primary text-primary-foreground p-12 relative">
        <Link to="/" className="font-serif text-2xl">Kulturrat<span className="text-accent">.</span></Link>
        <div className="absolute bottom-12 left-12 right-12">
          <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Edition · Mitglieder</div>
          <p className="font-serif text-3xl leading-snug">
            „Wir sind die Stimme derer, die Kultur erschaffen.“
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-serif text-4xl">{mode === "signin" ? "Anmelden" : "Mitglied werden"}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === "signin" ? "Willkommen zurück." : "In wenigen Schritten dabei."}
            </p>
          </div>

          {mode === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fn">Vorname</Label>
                  <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="ln">Nachname</Label>
                  <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={80} />
                </div>
              </div>
              <div>
                <Label>Sparte</Label>
                <Select value={sparte} onValueChange={setSparte}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPARTEN.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
          </div>
          <div>
            <Label htmlFor="pw">Passwort</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Bitte warten..." : mode === "signin" ? "Anmelden" : "Konto erstellen"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Noch kein Konto? " : "Bereits Mitglied? "}
            <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-accent underline">
              {mode === "signin" ? "Mitglied werden" : "Anmelden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
