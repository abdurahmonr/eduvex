/**
 * Shared Tailwind CSS Preset
 * Education Center ERP + CRM
 */

export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        portal: {
          director: '#4f46e5',
          admin: '#0284c7',
          teacher: '#059669',
          student: '#d97706',
          parent: '#7c3aed'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};
