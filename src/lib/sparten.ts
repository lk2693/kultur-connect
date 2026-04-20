export const SPARTEN = [
  { value: "musik", label: "Musik" },
  { value: "theater", label: "Theater" },
  { value: "tanz", label: "Tanz" },
  { value: "bildende_kunst", label: "Bildende Kunst" },
  { value: "literatur", label: "Literatur" },
  { value: "film", label: "Film" },
  { value: "fotografie", label: "Fotografie" },
  { value: "performance", label: "Performance" },
  { value: "medienkunst", label: "Medienkunst" },
  { value: "sonstiges", label: "Sonstiges" },
] as const;

export type SparteValue = (typeof SPARTEN)[number]["value"];

export const sparteLabel = (v: string) =>
  SPARTEN.find((s) => s.value === v)?.label ?? v;
