/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'action-primary': 'var(--action-primary)',
        'action-hover': 'var(--action-hover)',
        'action-disabled': 'var(--action-disabled)',
        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        'background-tertiary-hover': 'var(--background-tertiary-hover)',
        'text-error': 'var(--text-error)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-default': 'var(--text-default)',
        'background-error': '#e01a4f29',
        'background-success': 'rgba(0, 245, 221, 0.08)',
        'background-warning': 'rgba(255, 255, 255, 0.078)'
      },
    },
    plugins: [],
  }
}
