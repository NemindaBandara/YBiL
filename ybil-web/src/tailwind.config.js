/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        transit: {
          sltb: "#dc2626", // Red for SLTB buses
          private: "#2563eb", // Blue for Private buses
          surface: "#0f172a",
          card: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};
