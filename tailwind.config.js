/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'minecraft-card',
    'minecraft-button',
    'minecraft-button-primary',
    'minecraft-button-secondary',
    'minecraft-button-danger',
    'minecraft-button-stone',
    'minecraft-panel',
    'minecraft-input',
    'minecraft-table',
    'block-shadow',
    'pixel-bg',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
