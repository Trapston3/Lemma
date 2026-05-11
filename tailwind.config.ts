import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        md: {
          // Primary
          'primary':               'var(--md-sys-color-primary)',
          'on-primary':            'var(--md-sys-color-on-primary)',
          'primary-container':     'var(--md-sys-color-primary-container)',
          'on-primary-container':  'var(--md-sys-color-on-primary-container)',

          // Secondary
          'secondary':             'var(--md-sys-color-secondary)',
          'on-secondary':          'var(--md-sys-color-on-secondary)',
          'secondary-container':   'var(--md-sys-color-secondary-container)',
          'on-secondary-container':'var(--md-sys-color-on-secondary-container)',

          // Tertiary
          'tertiary':              'var(--md-sys-color-tertiary)',
          'on-tertiary':           'var(--md-sys-color-on-tertiary)',
          'tertiary-container':    'var(--md-sys-color-tertiary-container)',
          'on-tertiary-container': 'var(--md-sys-color-on-tertiary-container)',

          // Error
          'error':                 'var(--md-sys-color-error)',
          'on-error':              'var(--md-sys-color-on-error)',
          'error-container':       'var(--md-sys-color-error-container)',
          'on-error-container':    'var(--md-sys-color-on-error-container)',

          // Surface
          'surface':               'var(--md-sys-color-surface)',
          'on-surface':            'var(--md-sys-color-on-surface)',
          'surface-variant':       'var(--md-sys-color-surface-variant)',
          'on-surface-variant':    'var(--md-sys-color-on-surface-variant)',

          // Surface Containers
          'surface-dim':               'var(--md-sys-color-surface-dim)',
          'surface-bright':            'var(--md-sys-color-surface-bright)',
          'surface-container-lowest':  'var(--md-sys-color-surface-container-lowest)',
          'surface-container-low':     'var(--md-sys-color-surface-container-low)',
          'surface-container':         'var(--md-sys-color-surface-container)',
          'surface-container-high':    'var(--md-sys-color-surface-container-high)',
          'surface-container-highest': 'var(--md-sys-color-surface-container-highest)',

          // Outline
          'outline':               'var(--md-sys-color-outline)',
          'outline-variant':       'var(--md-sys-color-outline-variant)',

          // Inverse
          'inverse-surface':       'var(--md-sys-color-inverse-surface)',
          'inverse-on-surface':    'var(--md-sys-color-inverse-on-surface)',
          'inverse-primary':       'var(--md-sys-color-inverse-primary)',
        },
      },
      borderRadius: {
        'md-sm':    '8px',
        'md-md':    '12px',
        'md-lg':    '16px',
        'md-xl':    '28px',
        'md-full':  '9999px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'md-1': '0 1px 2px 0 rgba(0,0,0,0.05)',
        'md-2': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'md-3': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
