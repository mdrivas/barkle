import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", ...fontFamily.sans],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
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
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "medal-shine": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 200%" },
        },
        'fall-0': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)' }
        },
        'fall-1': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(-360deg)' }
        },
        'fall-2': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)' }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 3s linear infinite",
        "medal-shine": "medal-shine 8s linear infinite",
        'fall-0': 'fall-0 5s linear infinite',
        'fall-1': 'fall-1 6s linear infinite',
        'fall-2': 'fall-2 4s linear infinite'
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, rgba(255, 215, 0, 0.5) 25%, rgba(184, 134, 11, 0.5) 25%, rgba(255, 215, 0, 0.5) 50%, rgba(184, 134, 11, 0.5) 50%, rgba(255, 215, 0, 0.5) 75%, rgba(184, 134, 11, 0.5) 75%, rgba(255, 215, 0, 0.5))",
        "silver-gradient":
          "linear-gradient(135deg, rgba(192, 192, 192, 0.5) 25%, rgba(128, 128, 128, 0.5) 25%, rgba(192, 192, 192, 0.5) 50%, rgba(128, 128, 128, 0.5) 50%, rgba(192, 192, 192, 0.5) 75%, rgba(128, 128, 128, 0.5) 75%, rgba(192, 192, 192, 0.5))",
        "bronze-gradient":
          "linear-gradient(135deg, rgba(205, 127, 50, 0.5) 25%, rgba(139, 69, 19, 0.5) 25%, rgba(205, 127, 50, 0.5) 50%, rgba(139, 69, 19, 0.5) 50%, rgba(205, 127, 50, 0.5) 75%, rgba(139, 69, 19, 0.5) 75%, rgba(205, 127, 50, 0.5))",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
