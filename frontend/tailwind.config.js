/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070f",
        panel: "#0c1224",
        panelSoft: "#121a31",
        accent: "#b595ff",
        accentSoft: "#7f6ceb",
        highlight: "#ffc85f",
      },
      boxShadow: {
        aura: "0 0 0 1px rgba(181,149,255,0.22), 0 20px 45px rgba(0,0,0,0.45)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(181,149,255,0.25), 0 0 18px rgba(181,149,255,0.28)" },
          "50%": { boxShadow: "0 0 0 1px rgba(181,149,255,0.4), 0 0 28px rgba(181,149,255,0.55)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
