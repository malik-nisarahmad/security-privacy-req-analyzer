import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // High-Fidelity Claymorphism palette
        clay: {
          canvas: "#F4F1FA",
          foreground: "#332F3A",
          muted: "#635F69",
          cardBg: "#FFFFFF",
          input: "#EFEBF5",
          accent: "#7C3AED",
          "accent-light": "#A78BFA",
          "accent-alt": "#DB2777",
          sky: "#0EA5E9",
          emerald: "#10B981",
          amber: "#F59E0B",
        },
      },
      boxShadow: {
        clayCard:
          "16px 16px 32px rgba(160, 150, 180, 0.2), -10px -10px 24px #ffffff, inset 6px 6px 12px rgba(139, 92, 246, 0.03), inset -6px -6px 12px #ffffff",
        clayCardHover:
          "20px 20px 40px rgba(160, 150, 180, 0.28), -12px -12px 28px #ffffff, inset 6px 6px 12px rgba(139, 92, 246, 0.05), inset -6px -6px 12px #ffffff",
        clayButton:
          "12px 12px 24px rgba(139, 92, 246, 0.28), -8px -8px 16px rgba(255, 255, 255, 0.6), inset 4px 4px 8px rgba(255, 255, 255, 0.4), inset -4px -4px 8px rgba(0, 0, 0, 0.08)",
        clayButtonHover:
          "14px 14px 28px rgba(139, 92, 246, 0.35), -10px -10px 20px rgba(255, 255, 255, 0.7), inset 4px 4px 8px rgba(255, 255, 255, 0.45), inset -4px -4px 8px rgba(0, 0, 0, 0.08)",
        clayPressed:
          "inset 8px 8px 16px #dcd7e7, inset -8px -8px 16px #ffffff",
        claySurface:
          "30px 30px 60px #cdc6d9, -30px -30px 60px #ffffff, inset 10px 10px 20px rgba(139, 92, 246, 0.04), inset -10px -10px 20px rgba(255, 255, 255, 0.8)",
        clayOrb:
          "10px 10px 20px rgba(139, 92, 246, 0.2), -6px -6px 12px #ffffff, inset 3px 3px 6px rgba(255, 255, 255, 0.6), inset -3px -3px 6px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "clay-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        "clay-float-delayed": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(-2deg)" },
        },
        "clay-breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "clay-float": "clay-float 8s ease-in-out infinite",
        "clay-float-delayed": "clay-float-delayed 10s ease-in-out infinite",
        "clay-breathe": "clay-breathe 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
