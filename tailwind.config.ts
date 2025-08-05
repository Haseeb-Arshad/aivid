import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        // Custom color palette for the video editor
        gray: {
          950: '#0a0a0a',
        },
      },
      animation: {
        'spin': 'spin 1s linear infinite',
      },
      transitionProperty: {
        'transform': 'transform',
      },
      scale: {
        '105': '1.05',
        '110': '1.1',
      },
    },
  },
  plugins: [],
} satisfies Config;
