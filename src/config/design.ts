export const designColors = {
  ivory: "#f7efe2",
  pearl: "#fffdf8",
  cream: "#eadbc5",
  warmWhite: "#faf8f5",
  blush: "#e8ddd4",
  nude: "#c9b8a8",
  champagne: "#cfc0a8",
  taupe: "#a09080",
  sage: "#879070",
  olive: "#3f4a36",
  gold: "#b8a882",
  paleGold: "#cfc0a8",
  burgundy: "#7a2535",
  wine: "#541b29",
  charcoal: "#2f2a26",
  muted: "#8c7f75",
} as const;

export const designTypography = {
  display:
    '"Bodoni 72", "Didot", "Iowan Old Style", Georgia, "Times New Roman", "Apple Color Emoji", "Segoe UI Emoji", serif',
  body: '"Avenir Next", Avenir, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
} as const;

export const designSpacing = {
  sectionY: "5.5rem",
  shellX: "1.5rem",
  cardPadding: "1.25rem",
} as const;

export const designRadius = {
  card: "8px",
  shell: "8px",
  pill: "999px",
} as const;

export const designShadows = {
  shell: "0 28px 96px rgb(47 42 38 / 0.18)",
  raised: "0 18px 45px rgb(47 42 38 / 0.11)",
} as const;

export const assetSlots = {
  outerPaperTexture: "/assets/outer-paper-texture.webp",
  heroBotanical: "/assets/hero-botanical.webp",
  floralTopLeft: "/assets/floral-top-left.webp",
  floralBottomRight: "/assets/floral-bottom-right.webp",
  veilTexture: "/assets/veil-texture.webp",
  paperTexture: "/assets/paper-texture.webp",
  goldDivider: "/assets/gold-divider.svg",
  hennaOrnament: "/assets/henna-ornament.svg",
  ceremonyOrnament: "/assets/ceremony-ornament.svg",
  memoryEnvelope: "/assets/memory-envelope.svg",
  mediterraneanBotanicalLeft: "/assets/mediterranean-botanical-left.png",
  mediterraneanBotanicalRight: "/assets/mediterranean-botanical-right.png",
  mediterraneanBotanicalAccent: "/assets/mediterranean-botanical-accent.png",
} as const;

export const eventTheme = {
  henna: {
    accent: designColors.burgundy,
    accentSoft: designColors.gold,
    surface: designColors.pearl,
  },
  ceremony: {
    accent: designColors.olive,
    accentSoft: designColors.paleGold,
    surface: designColors.ivory,
  },
} as const;
