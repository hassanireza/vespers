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

// Route paths are left unchanged from the earlier build so existing links
// keep working. Only the names, framing, and visual treatment change.
export const GAMES: GameMeta[] = [
  {
    id: "neon-blocks",
    slug: "neon-blocks",
    title: "Reliquary",
    category: "Rite I \u2014 Accumulation",
    description:
      "Weight finds weight. Each form descends and settles, layer upon layer, until the vessel is full or it is not. Nothing is undone. A quiet, unglamorous devotion to stacking what falls.",
    glow: "reliquary",
    route: "/games/neon-blocks",
  },
  {
    id: "tic-tac-toe",
    slug: "tic-tac-toe",
    title: "Covenant",
    category: "Rite II \u2014 Communion",
    description:
      "Two marks, one grid, a pact neither side can break unread. Face an opponent who never tires \u2014 gentle at first, then patient beyond patience, then unwilling to lose at all.",
    glow: "covenant",
    route: "/games/tic-tac-toe",
  },
  {
    id: "neural-grid",
    slug: "neural-grid",
    title: "Abyssal Bloom",
    category: "Rite III \u2014 Shedding",
    description:
      "Set a single cell adrift and watch what it becomes. Colonies bloom, starve, and dissolve back into the dark by rules older than the screen that renders them.",
    glow: "abyss",
    route: "/games/neural-grid",
  },
];
