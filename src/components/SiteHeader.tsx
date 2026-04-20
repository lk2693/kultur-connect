import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const linkProps = {
    activeProps: { className: "text-accent" },
    className:
      "text-sm uppercase tracking-[0.18em] text-foreground/70 hover:text-foreground transition-colors",
  };

  return (
    <header className="border-b border-border bg-background/90 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="font-serif text-2xl font-semibold tracking-tight">
          Kulturrat
          <span className="text-accent">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/veranstaltungen" {...linkProps}>
            Veranstaltungen
          </Link>
          <Link to="/mitglieder" {...linkProps}>
            Mitglieder
          </Link>
          <Link to="/ueber-uns" {...linkProps}>
            Über uns
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profil">Profil</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/veranstaltungen/neu">Event anlegen</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                Abmelden
              </Button>
              {isAdmin && (
                <span className="hidden lg:inline text-[10px] uppercase tracking-widest text-accent border border-accent px-2 py-1">
                  Kulturrat
                </span>
              )}
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Anmelden</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">Mitglied werden</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm text-muted-foreground">
        <div>
          <div className="font-serif text-xl text-foreground">Kulturrat</div>
          <p className="mt-3 max-w-xs">
            Vereint Kulturschaffende und schafft Sichtbarkeit für kulturelle Vielfalt.
          </p>
        </div>
        <div>
          <div className="uppercase tracking-widest text-xs text-foreground mb-3">Navigation</div>
          <ul className="space-y-2">
            <li><Link to="/veranstaltungen">Veranstaltungen</Link></li>
            <li><Link to="/mitglieder">Mitglieder</Link></li>
            <li><Link to="/ueber-uns">Über uns</Link></li>
          </ul>
        </div>
        <div>
          <div className="uppercase tracking-widest text-xs text-foreground mb-3">Mitwirken</div>
          <ul className="space-y-2">
            <li><Link to="/auth">Mitglied werden</Link></li>
            <li><Link to="/auth">Anmelden</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kulturrat
      </div>
    </footer>
  );
}
