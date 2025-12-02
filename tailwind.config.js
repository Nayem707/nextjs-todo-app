/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
        144: '36rem',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        glow: '0 0 20px hsl(var(--primary) / 0.3)',
        'glow-success': '0 0 20px hsl(var(--success) / 0.3)',
        'glow-danger': '0 0 20px hsl(var(--destructive) / 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-danger': 'var(--gradient-danger)',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-500) var(--ease-out)',
        'slide-in-from-left':
          'slideInFromLeft var(--duration-500) var(--ease-out)',
        'slide-in-from-right':
          'slideInFromRight var(--duration-500) var(--ease-out)',
        'slide-in-from-top':
          'slideInFromTop var(--duration-500) var(--ease-out)',
        'slide-in-from-bottom':
          'slideInFromBottom var(--duration-500) var(--ease-out)',
        'bounce-in': 'bounceIn var(--duration-700) var(--ease-out)',
        'scale-in': 'scaleIn var(--duration-300) var(--ease-out)',
        'pulse-gentle': 'pulseGentle 2s var(--ease-in-out) infinite',
        float: 'float 3s var(--ease-in-out) infinite',
        skeleton: 'loading 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInFromLeft: {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromTop: {
          from: { opacity: '0', transform: 'translateY(-100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromBottom: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        loading: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      transitionDuration: {
        75: 'var(--duration-75)',
        100: 'var(--duration-100)',
        150: 'var(--duration-150)',
        200: 'var(--duration-200)',
        300: 'var(--duration-300)',
        500: 'var(--duration-500)',
        700: 'var(--duration-700)',
        1000: 'var(--duration-1000)',
      },
      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        xs: '475px',
        '3xl': '1600px',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [
    // Custom plugin for advanced utilities
    function ({ addUtilities, addComponents, theme }) {
      // Glass morphism utilities
      addUtilities({
        '.glass': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'hsl(var(--background) / 0.8)',
          border: '1px solid hsl(var(--border) / 0.3)',
        },
        '.glass-strong': {
          'backdrop-filter': 'blur(24px) saturate(200%)',
          'background-color': 'hsl(var(--background) / 0.9)',
          border: '1px solid hsl(var(--border) / 0.5)',
        },
      });

      // Interactive utilities
      addUtilities({
        '.interactive': {
          transition: 'all var(--duration-200) var(--ease-out)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.card-hover': {
          transition: 'all var(--duration-300) var(--ease-out)',
          '&:hover': {
            transform: 'translateY(-4px)',
            'box-shadow': 'var(--shadow-xl)',
          },
        },
      });

      // Text gradient utilities
      addUtilities({
        '.text-gradient-primary': {
          background: 'var(--gradient-primary)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-success': {
          background: 'var(--gradient-success)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
      });

      // Button components
      addComponents({
        '.btn-primary': {
          background: 'var(--gradient-primary)',
          border: 'none',
          color: 'white',
          padding: '0.5rem 1rem',
          'border-radius': 'var(--radius)',
          'font-weight': '500',
          transition: 'all var(--duration-200) var(--ease-out)',
          '&:hover': {
            transform: 'translateY(-1px)',
            'box-shadow': 'var(--shadow-lg)',
            filter: 'brightness(1.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-glass': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'hsl(var(--background) / 0.8)',
          border: '1px solid hsl(var(--border) / 0.3)',
          padding: '0.5rem 1rem',
          'border-radius': 'var(--radius)',
          transition: 'all var(--duration-200) var(--ease-out)',
          '&:hover': {
            'background-color': 'hsl(var(--background) / 0.9)',
            transform: 'translateY(-1px)',
          },
        },
      });
    },
  ],
};
