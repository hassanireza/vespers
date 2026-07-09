export type GameGlow = "reliquary" | "covenant" | "abyss";

export interface GameMeta {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  glow: GameGlow;
  route: string;
}

export const GAMES: GameMeta[] = [
  {
    id: "neon-blocks",
    slug: "reliquary",
    title: "Reliquary",
    category: "Rite I: Accumulation",
    description:
      "Weight finds weight. Each form descends and settles, layer upon layer, until the vessel is full or it is not. Nothing is undone. A quiet, unglamorous devotion to stacking what falls.",
    glow: "reliquary",
    route: "/games/reliquary",
  },
  {
    id: "tic-tac-toe",
    slug: "covenant",
    title: "Covenant",
    category: "Rite II: Communion",
    description:
      "Two marks, one grid, a pact neither side can break unread. Face an opponent who never tires, gentle at first, then patient beyond patience, then unwilling to lose at all.",
    glow: "covenant",
    route: "/games/covenant",
  },
  {
    id: "neural-grid",
    slug: "abyssal-bloom",
    title: "Abyssal Bloom",
    category: "Rite III: Shedding",
    description:
      "Set a single cell adrift and watch what it becomes. Colonies bloom, starve, and dissolve back into the dark by rules older than the screen that renders them.",
    glow: "abyss",
    route: "/games/abyssal-bloom",
  },
];
