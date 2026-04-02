/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds (dark spectrum)
        surface: {
          DEFAULT: "#0a0c14",      // Deepest background
          secondary: "#0f1420",     // Secondary bg (panels)
          tertiary: "#141b2d",      // Card/elevated surfaces
          elevated: "#1a2340",     // Higher elevation
        },
        // Content colors
        content: {
          DEFAULT: "#e8ecff",      // Primary text
          secondary: "#94a3b8",    // Secondary/muted text
          tertiary: "#64748b",       // Tertiary/disabled text
          inverse: "#0a0c14",      // Text on light backgrounds
        },
        // Accent colors (purple/violet spectrum)
        accent: {
          DEFAULT: "#a78bfa",      // Primary accent
          secondary: "#8b5cf6",     // Secondary accent
          tertiary: "#6366f1",      // Tertiary accent
          soft: "rgba(167, 139, 250, 0.15)",  // Soft accent bg
          glow: "rgba(167, 139, 250, 0.4)",   // Glow effect
        },
        // Semantic colors
        success: {
          DEFAULT: "#10b981",
          soft: "rgba(16, 185, 129, 0.15)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          soft: "rgba(245, 158, 11, 0.15)",
        },
        danger: {
          DEFAULT: "#ef4444",
          soft: "rgba(239, 68, 68, 0.15)",
        },
        info: {
          DEFAULT: "#06b6d4",
          soft: "rgba(6, 182, 212, 0.15)",
        },
        // Legacy aliases (for gradual migration)
        ink: "#0a0c14",
        panel: "#0f1420",
        panelSoft: "#141b2d",
        textDim: "#94a3b8",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        // Glassmorphism shadows
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        glow: "0 0 20px rgba(167, 139, 250, 0.3)",
        "glow-lg": "0 0 40px rgba(167, 139, 250, 0.4)",
        // Legacy alias
        aura: "0 0 0 1px rgba(181,149,255,0.22), 0 20px 45px rgba(0,0,0,0.45)",
      },
      borderRadius: {
        glass: "16px",
        "glass-sm": "12px",
        "glass-lg": "24px",
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
