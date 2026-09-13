export type CardTheme =
  | 'light'
  | 'dark'
  | 'tokyo-night'
  | 'dracula'
  | 'nord'
  | 'radical'
  | 'catppuccin';

export interface ThemeColors {
  bg: string;
  border: string;
  title: string;
  text: string;
  icon: string;
  bold: string;
  fire: string;
  badgeBg: string;
  badgeText: string;
}

export const THEMES: Record<CardTheme, ThemeColors> = {
  light: {
    bg: '#ffffff',
    border: '#e1e4e8',
    title: '#0969da',
    text: '#57606a',
    icon: '#57606a',
    bold: '#24292f',
    fire: '#fa4549',
    badgeBg: '#f6f8fa',
    badgeText: '#57606a',
  },
  dark: {
    bg: '#0d1117',
    border: '#30363d',
    title: '#58a6ff',
    text: '#8b949e',
    icon: '#8b949e',
    bold: '#c9d1d9',
    fire: '#ff7b72',
    badgeBg: '#161b22',
    badgeText: '#8b949e',
  },
  'tokyo-night': {
    bg: '#1a1b26',
    border: '#414868',
    title: '#7aa2f7',
    text: '#9aa5ce',
    icon: '#7aa2f7',
    bold: '#cfc9c2',
    fire: '#f7768e',
    badgeBg: '#24283b',
    badgeText: '#7aa2f7',
  },
  dracula: {
    bg: '#282a36',
    border: '#6272a4',
    title: '#bd93f9',
    text: '#bfbfbf',
    icon: '#ff79c6',
    bold: '#f8f8f2',
    fire: '#ff5555',
    badgeBg: '#44475a',
    badgeText: '#f8f8f2',
  },
  nord: {
    bg: '#2e3440',
    border: '#4c566a',
    title: '#88c0d0',
    text: '#d8dee9',
    icon: '#81a1c1',
    bold: '#eceff4',
    fire: '#bf616a',
    badgeBg: '#3b4252',
    badgeText: '#88c0d0',
  },
  radical: {
    bg: '#141321',
    border: '#312d4a',
    title: '#fe428e',
    text: '#a9fef7',
    icon: '#fe428e',
    bold: '#f8d2f0',
    fire: '#f82570',
    badgeBg: '#221f3b',
    badgeText: '#fe428e',
  },
  catppuccin: {
    bg: '#1e1e2e',
    border: '#45475a',
    title: '#cdd6f4',
    text: '#a6adc8',
    icon: '#b4befe',
    bold: '#cdd6f4',
    fire: '#f38ba8',
    badgeBg: '#313244',
    badgeText: '#cba6f7',
  },
};

export interface CustomThemeOptions {
  theme?: string | null;
  bg?: string | null;
  border?: string | null;
  title?: string | null;
  text?: string | null;
  hideBorder?: boolean;
}

export function getTheme(options: CustomThemeOptions = {}): ThemeColors {
  const key = (options.theme || 'light').toLowerCase() as CardTheme;
  const base = THEMES[key] || THEMES.light;

  const sanitizeHex = (hex: string) => {
    const clean = hex.replace(/[^0-9a-fA-F]/g, '');
    return clean.length === 3 || clean.length === 6 || clean.length === 8 ? `#${clean}` : null;
  };

  const border = options.hideBorder
    ? 'transparent'
    : (options.border && sanitizeHex(options.border)) || base.border;

  return {
    ...base,
    bg: (options.bg && sanitizeHex(options.bg)) || base.bg,
    border,
    title: (options.title && sanitizeHex(options.title)) || base.title,
    text: (options.text && sanitizeHex(options.text)) || base.text,
    bold: (options.text && sanitizeHex(options.text)) || base.bold,
  };
}
