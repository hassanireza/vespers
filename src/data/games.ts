export type GameGlow = "reliquary" | "covenant" | "abyss";

export interface GameFact {
  label: string;
  value: string;
}

export interface GameMeta {
  id: string;
  slug: string;
  title: string;
  /** Roman numeral of the rite, used by the carousel rail. */
  numeral: string;
  category: string;
  description: string;
  /** Three short, factual lines shown on the carousel slide. */
  facts: GameFact[];
  glow: GameGlow;
  route: string;
}

export const GAMES: GameMeta[] = [
  {
    id: "neon-blocks",
    slug: "reliquary",
    title: "Reliquary",
    numeral: "I",
    category: "Rite I: Accumulation",
    description:
      "Weight finds weight. Each form descends and settles, layer upon layer, until the vessel is full or it is not. Nothing is undone. A quiet, unglamorous devotion to stacking what falls.",
    facts: [
      { label: "Controls", value: "Keyboard or touch" },
      { label: "Aids", value: "Hold and next preview" },
      { label: "Pace", value: "Quickens every level" },
    ],
    glow: "reliquary",
    route: "/games/reliquary",
  },
  {
    id: "tic-tac-toe",
    slug: "covenant",
    title: "Covenant",
    numeral: "II",
    category: "Rite II: Communion",
    description:
      "Two marks, one grid, a pact neither side can break unread. Face an opponent who never tires, gentle at first, then patient beyond patience, then unwilling to lose at all.",
    facts: [
      { label: "Opponent", value: "Easy, Normal, Impossible" },
      { label: "Players", value: "One" },
      { label: "Record", value: "Wins, draws, losses" },
    ],
    glow: "covenant",
    route: "/games/covenant",
  },
  {
    id: "neural-grid",
    slug: "abyssal-bloom",
    title: "Abyssal Bloom",
    numeral: "III",
    category: "Rite III: Shedding",
    description:
      "Set a single cell adrift and watch what it becomes. Colonies bloom, starve, and dissolve back into the dark by rules older than the screen that renders them.",
    facts: [
      { label: "Seeds", value: "Glider, Pulsar, Glider Gun" },
      { label: "Pace", value: "Adjustable" },
      { label: "Play", value: "Click cells to place them" },
    ],
    glow: "abyss",
    route: "/games/abyssal-bloom",
  },
];
