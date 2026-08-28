/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  corePlugins: {
    // We ship our own cursor rules (the custom cursor needs `cursor: none`),
    // and nothing here uses the container or float utilities.
    container: false,
    float: false,
    clear: false,
  },
  plugins: [],
};
