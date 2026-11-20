import sharedPreset from '@education-erp/shared-config/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedPreset],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    '../../packages/shared-ui/src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
