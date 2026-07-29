/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fondo: "#1D1E1C",
        superficie: "#2A2B28",
        dorado: "#CFA846",
        rojo: "#BA1819",
        texto: "#F5F1E8",
        "texto-secundario": "#8C8C86",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
