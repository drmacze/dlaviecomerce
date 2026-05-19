import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./stores/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)"] },
      boxShadow: {
        brutal: "6px 6px 0px 0px rgb(15 23 42)",
        "brutal-sm": "3px 3px 0px 0px rgb(15 23 42)",
        glow: "0 0 80px rgba(16,185,129,.25)"
      },
      keyframes: {
        shine: { to: { backgroundPosition: "200% center" } },
        gridMove: { from: { backgroundPosition: "0 0" }, to: { backgroundPosition: "32px 32px" } }
      },
      animation: { shine: "shine 3s linear infinite", "grid-move": "gridMove 8s linear infinite" }
    }
  },
  plugins: [animate]
};
export default config;
