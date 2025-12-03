/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0C0F",
        surface: "#131418",
        accent: "#10B981",
        "accent-hover": "#34D399",
        "text-primary": "#F5F5F7",
        "text-muted": "#9CA3AF",
        border: "#272A30",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
