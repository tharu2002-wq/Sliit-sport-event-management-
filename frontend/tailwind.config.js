/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10212b",
        coral: "#ff7445",
        mint: "#6dd9c7",
        sand: "#f9f4e8",
        sky: "#e7f6ff",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Outfit'", "sans-serif"],
      },
      boxShadow: {
        float: "0 20px 40px -24px rgba(16, 33, 43, 0.55)",
      },
      animation: {
        rise: "rise 600ms ease-out",
        pulseSoft: "pulseSoft 1800ms ease-in-out infinite",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.03)", opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};
