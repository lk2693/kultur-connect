import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/ueber-uns")({
  head: () => ({
    meta: [
      { title: "Über uns — Kulturrat" },
      { name: "description", content: "Der Kulturrat als Stimme der Kulturschaffenden." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-6 py-16 flex-1 max-w-4xl">
        <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Manifest</div>
        <h1 className="font-serif text-5xl md:text-7xl text-balance">
          Eine Stimme für <em className="text-accent not-italic font-medium">die Kultur</em>.
        </h1>
        <div className="editorial-rule my-12" />

        <div className="grid md:grid-cols-12 gap-10 text-foreground/90 leading-relaxed">
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">§ 01</div>
            <div className="font-serif text-2xl mt-1">Auftrag</div>
          </div>
          <p className="md:col-span-9 text-lg">
            Der Kulturrat vertritt die Interessen der Kulturschaffenden. Wir vernetzen, fördern und
            machen sichtbar — über Sparten, Generationen und Disziplinen hinweg.
          </p>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">§ 02</div>
            <div className="font-serif text-2xl mt-1">Plattform</div>
          </div>
          <p className="md:col-span-9 text-lg">
            Diese Plattform ist Werkzeug, Bühne und Verzeichnis zugleich. Mitglieder pflegen ihr
            Profil, präsentieren ihr Schaffen und veröffentlichen Veranstaltungen, die unsere
            Kulturlandschaft prägen.
          </p>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">§ 03</div>
            <div className="font-serif text-2xl mt-1">Mitwirken</div>
          </div>
          <p className="md:col-span-9 text-lg">
            Die Mitgliedschaft steht allen offen, die kulturell tätig sind. Eine Anmeldung genügt —
            der Rest entsteht durch das, was du beiträgst.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
