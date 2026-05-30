/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds (resolved via CSS custom properties with color-mix support)
        surface: {
          DEFAULT: "rgb(var(--surface-rgb) / <alpha-value>)",
          secondary: "rgb(var(--surface-secondary-rgb) / <alpha-value>)",
          tertiary: "rgb(var(--surface-tertiary-rgb) / <alpha-value>)",
          elevated: "rgb(var(--surface-elevated-rgb) / <alpha-value>)",
        },
        // Content colors
        content: {
          DEFAULT: "rgb(var(--content-rgb) / <alpha-value>)",
          secondary: "rgb(var(--content-secondary-rgb) / <alpha-value>)",
          tertiary: "rgb(var(--content-tertiary-rgb) / <alpha-value>)",
          inverse: "rgb(var(--content-inverse-rgb) / <alpha-value>)",
        },
        // Accent colors (purple/violet spectrum)
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          secondary: "rgb(var(--accent-secondary-rgb) / <alpha-value>)",
          tertiary: "rgb(var(--accent-tertiary-rgb) / <alpha-value>)",
          soft: "rgb(var(--accent-soft-rgb) / <alpha-value>)",
          glow: "rgb(var(--accent-glow-rgb) / <alpha-value>)",
        },
        // Semantic colors
        success: {
          DEFAULT: "rgb(var(--success-rgb) / <alpha-value>)",
          soft: "rgb(var(--success-soft-rgb) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning-rgb) / <alpha-value>)",
          soft: "rgb(var(--warning-soft-rgb) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger-rgb) / <alpha-value>)",
          soft: "rgb(var(--danger-soft-rgb) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--info-rgb) / <alpha-value>)",
          soft: "rgb(var(--info-soft-rgb) / <alpha-value>)",
        },
        // Legacy aliases (for gradual migration)
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        panel: "rgb(var(--panel-rgb) / <alpha-value>)",
        panelSoft: "rgb(var(--panel-soft-rgb) / <alpha-value>)",
        textDim: "rgb(var(--text-dim-rgb) / <alpha-value>)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        // Glassmorphism shadows
        glass: "var(--shadow-glass)",
        "glass-lg": "var(--shadow-glass-lg)",
        glow: "var(--shadow-glow)",
        "glow-lg": "var(--shadow-glow-lg)",
        // Legacy alias
        aura: "var(--shadow-aura)",
      },
      borderRadius: {
        glass: "var(--radius-glass)",
        "glass-sm": "var(--radius-glass-sm)",
        "glass-lg": "var(--radius-glass-lg)",
      },
      backdropBlur: {
        glass: "16px",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(167,139,250,0.25), 0 0 18px rgba(167,139,250,0.28)" },
          "50%": { boxShadow: "0 0 0 1px rgba(167,139,250,0.4), 0 0 28px rgba(167,139,250,0.55)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        fadeIn: "fadeIn 0.4s ease-out",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
        display: ['"Barlow Condensed"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
