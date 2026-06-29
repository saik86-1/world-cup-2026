/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#06070A",
        panel: "#0D0F15",
        panel2: "#13161F",
        line: "#222632",
        pitch: "#19E68C",
        electric: "#5EC8FF",
        gold: "#F4C04A",
        danger: "#FF5468",
        muted: "#8B93A7",
      },
      fontFamily: {
        display: ["Anton", "Impact", "sans-serif"],
        head: ["Archivo", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.05em",
      },
    },
  },
  plugins: [],
};
