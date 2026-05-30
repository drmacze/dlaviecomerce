import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./stores/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: {
        brutal: "6px 6px 0px 0px rgb(15 23 42)",
        "brutal-sm": "3px 3px 0px 0px rgb(15 23 42)",
        glow: "0 0 80px rgba(16,185,129,.25)"
      },
      keyframes: { shine: { to: { backgroundPosition: "200% center" } } },
      animation: { shine: "shine 3s linear infinite" }
    }
  },
  plugins: [animate]
};
export default config;
