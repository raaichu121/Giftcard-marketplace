/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Apple-style typography scale
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.6' }],
        'xl': ['20px', { lineHeight: '1.6' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.3' }],
        '4xl': ['32px', { lineHeight: '1.2' }],
        '5xl': ['36px', { lineHeight: '1.2' }],
        '6xl': ['48px', { lineHeight: '1.1' }],
        '7xl': ['60px', { lineHeight: '1.1' }],
      },
      colors: {
        // Premium neutral palette
        slate: {
          50: "#fafafa",
          100: "#f5f5f7",
          200: "#f0f0f3",
          300: "#e5e5ea",
          400: "#d4d4d4",
          500: "#a1a1a6",
          600: "#86868b",
          700: "#6c6c70",
          800: "#1d1d1f",
          900: "#0a0a0a",
        },
        // Minimal accent - warm gray
        accent: {
          50: "#fefdfb",
          100: "#fdf8f3",
          200: "#fde8d8",
          300: "#fdd9b5",
          400: "#f8b98f",
          500: "#ff9500", // Warm amber accent
          600: "#f77f00",
          700: "#d56000",
          800: "#a34c00",
          900: "#6d3200",
        },
        pink: {
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f8a5d4",
          400: "#f27eb6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        nepal: {
          crimson: "#DC143C",
          blue: "#003893",
          gold: "#D4AF37",
        },
        gc: {
          purple: "#0284c7",
          "purple-dark": "#075985",
          "purple-light": "#0ea5e9",
          border: "#e5e5e5",
          muted: "#a3a3a3",
        },
        gold: {
          50: "#fef3c7",
          100: "#fde68a",
          200: "#fcd34d",
          300: "#fbbf24",
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
          700: "#92400e",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },
      boxShadow: {
        xs: "0 0 0 1px rgba(15, 23, 42, 0.08)",
        sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        base: "0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px 0 rgba(15, 23, 42, 0.06)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)",
        lg: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)",
        xl: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)",
        "2xl": "0 25px 50px -12px rgba(15, 23, 42, 0.15)",
        glow: "0 0 20px rgba(167, 42, 92, 0.35)",
        "glow-gold": "0 0 20px rgba(212, 175, 55, 0.35)",
        "glow-lg": "0 0 40px rgba(167, 42, 92, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "bounce-sm": "bounceSm 2s infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "card-tilt": "cardTilt 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(167, 42, 92, 0.35)" },
          "50%": { boxShadow: "0 0 40px rgba(167, 42, 92, 0.7)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "1000px 0" },
          "100%": { backgroundPosition: "-1000px 0" },
        },
        bounceSm: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        gradientShift: {
          "0%, 100%": { "background-size": "200% 200%", "background-position": "left center" },
          "50%": { "background-size": "200% 200%", "background-position": "right center" },
        },
        cardTilt: {
          "0%, 100%": { transform: "rotateX(0deg) rotateY(0deg)" },
          "50%": { transform: "rotateX(8deg) rotateY(8deg)" },
        },
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
      },
    },
  },
  plugins: [],
};