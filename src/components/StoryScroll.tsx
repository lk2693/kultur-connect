import { useEffect, useRef, useState } from "react";
import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";

const stories = [
  {
    img: story1,
    name: "Lina · Tanz",
    quote:
      "Ich begann mit Choreografien in einem leeren Kellerraum. Heute trete ich auf den Bühnen der Stadt auf",
    after: "— und der Kulturrat hat mir geholfen, sichtbar zu werden.",
  },
  {
    img: story2,
    name: "Marko · Musik",
    quote: "Jazz lebt vom Moment.",
    after:
      "Über die Plattform fand ich Räume, Publikum und andere Musiker — die Szene atmet, wenn man sie zusammenbringt.",
  },
  {
    img: story3,
    name: "Eva · Bildende Kunst",
    quote:
      "Mein Atelier ist klein, meine Arbeiten groß.",
    after: "Der Kulturrat gibt meiner Arbeit ein Gegenüber jenseits der Galerien.",
  },
];

export function StoryScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / total, 0), 0.999);
      setActive(Math.floor(progress * stories.length));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="bg-foreground text-background">
      <div ref={sectionRef} style={{ height: `${stories.length * 100}vh` }}>
        <div className="sticky top-0 h-screen flex items-center">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="relative min-h-[60vh] flex flex-col justify-center">
              <div className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
                Stimmen · {String(active + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}
              </div>
              <div className="relative">
                {stories.map((s, i) => (
                  <div
                    key={s.name}
                    className={`transition-all duration-700 ${
                      i === active
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <p className="font-serif text-3xl md:text-5xl leading-[1.2] text-balance">
                      {s.quote}{" "}
                      <span className="text-background/50">{s.after}</span>
                    </p>
                    <div className="mt-8 text-sm uppercase tracking-widest text-background/60">
                      {s.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Image */}
            <div className="relative aspect-[4/5] w-full max-w-md ml-auto rounded-sm overflow-hidden">
              {stories.map((s, i) => (
                <img
                  key={s.name}
                  src={s.img}
                  alt={s.name}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
