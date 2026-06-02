import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const shadcnColor = (name: string) => `hsl(var(--${name}))`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        border: shadcnColor("border"),
        input: shadcnColor("input"),
        ring: shadcnColor("ring"),
        background: shadcnColor("background"),
        foreground: shadcnColor("foreground"),
        primary: {
          DEFAULT: shadcnColor("primary"),
          foreground: shadcnColor("primary-foreground"),
          border: shadcnColor("primary-border"),
        },
        secondary: {
          DEFAULT: shadcnColor("secondary"),
          foreground: shadcnColor("secondary-foreground"),
          border: shadcnColor("secondary-border"),
        },
        destructive: {
          DEFAULT: shadcnColor("destructive"),
          foreground: shadcnColor("destructive-foreground"),
          border: shadcnColor("destructive-border"),
        },
        muted: {
          DEFAULT: shadcnColor("muted"),
          foreground: shadcnColor("muted-foreground"),
        },
        accent: {
          DEFAULT: shadcnColor("accent"),
          foreground: shadcnColor("accent-foreground"),
        },
        popover: {
          DEFAULT: shadcnColor("popover"),
          foreground: shadcnColor("popover-foreground"),
        },
        card: {
          DEFAULT: shadcnColor("card"),
          foreground: shadcnColor("card-foreground"),
        },
        sidebar: {
          DEFAULT: shadcnColor("sidebar"),
          foreground: shadcnColor("sidebar-foreground"),
          primary: shadcnColor("sidebar-primary"),
          "primary-foreground": shadcnColor("sidebar-primary-foreground"),
          accent: shadcnColor("sidebar-accent"),
          "accent-foreground": shadcnColor("sidebar-accent-foreground"),
          border: shadcnColor("sidebar-border"),
          ring: shadcnColor("sidebar-ring"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brutal: "6px 6px 0px 0px rgb(15 23 42)",
        "brutal-sm": "3px 3px 0px 0px rgb(15 23 42)",
        glow: "0 0 80px rgba(16,185,129,.25)",
      },
      keyframes: { shine: { to: { backgroundPosition: "200% center" } } },
      animation: { shine: "shine 3s linear infinite" },
    },
  },
  plugins: [animate],
};
export default config;
