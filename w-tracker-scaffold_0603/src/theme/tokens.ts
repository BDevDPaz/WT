export const PALETTE = {
  obsidian: '#050505',
  graphite: '#121212',
  carbonMist: '#1A1A1A',
  steelLine: '#2A2A2A',
  mutedGold: '#C5A059',
  successGreen: '#2E7D32',
  amberWarning: '#F57C00',
  deepRed: '#C62828',
  slateBlue: '#455A64',
  white: '#FFFFFF',
  secondaryText: '#A1A1AA',
  mutedText: '#6B7280',
  paper: '#F5F5F5',
  paperLine: '#E0E0E0',
} as const;

export const FONT = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 28, fontWeight: '700' as const },
  h3: { fontSize: 22, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 2 },
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const RADIUS = { sm: 8, md: 16, lg: 22, xl: 28, pill: 999 } as const;
