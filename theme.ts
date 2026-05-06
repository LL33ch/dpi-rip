import {
  createTheme,
  defaultVariantColorsResolver,
  lighten,
  parseThemeColor,
  rgba,
  VariantColorsResolver,
} from '@mantine/core';

const variantColorResolver: VariantColorsResolver = (input) => {
  const defaultResolvedColors = defaultVariantColorsResolver(input);
  const parsed = parseThemeColor({
    color: input.color || 'gray',
    theme: input.theme,
    colorScheme: 'dark',
  });

  if (input.variant === 'soft') {
    const c1 = input.theme.colors[parsed.color][6];
    const c2 = input.theme.colors[parsed.color][7];
    return {
      background: `linear-gradient(135deg, ${rgba(c1, 0.15)} 0%, ${rgba(c2, 0.1)} 100%)`,
      border: `1px solid ${rgba(c1, 0.3)}`,
      color: `var(--mantine-color-${parsed.color}-4)`,
      hover: rgba(input.theme.colors[parsed.color][4], 0.1),
    };
  }

  if (input.variant === 'light') {
    return {
      background: rgba(parsed.value, 0.1),
      hover: rgba(parsed.value, 0.15),
      color: lighten(parsed.value, 0.35),
      border: 'transparent',
    };
  }

  return defaultResolvedColors;
};

export const theme = createTheme({
  variantColorResolver,
  colors: {
    dark: [
      '#fafcff',
      '#cad5e8',
      '#8697b5',
      '#4c5d7d',
      '#222833',
      '#222938',
      '#161b22',
      '#0d1117',
      '#080c10',
      '#030405',
    ],
    blue: [
      '#ddf4ff',
      '#b6e3ff',
      '#80ccff',
      '#54aeff',
      '#218bff',
      '#0969da',
      '#0550ae',
      '#033d8b',
      '#0a3069',
      '#002155',
    ],
  },
  primaryColor: 'blue',
  primaryShade: {
    light: 6,
    dark: 5,
  },
  white: '#ffffff',
  black: '#24292f',
  autoContrast: true,
  luminanceThreshold: 0.3,
  spacing: {
    xs: '0.525rem',
    sm: '0.65rem',
    md: '0.9rem',
    lg: '1.35rem',
    xl: '2.2rem',
  },
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
  fontSmoothing: true,
  respectReducedMotion: false,
  focusRing: 'auto',
  cursorType: 'default',
  components: {
    Input: {
      defaultProps: {
        variant: 'default',
        radius: 'xl',
      },
      styles: {},
    },
    Card: {
      defaultProps: {
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-6)',
        },
      },
    },
  },
});
