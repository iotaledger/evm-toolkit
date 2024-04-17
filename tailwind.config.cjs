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
        'color-error': 'var(--color-error)',
        'color-primary': 'var(--color-primary)',
        'color-secondary': 'var(--color-secondary)',
        'color-default': 'var(--color-default)',
        'background-error': 'var(--background-error)',
        'background-success': 'var(--background-success)',
        'background-warning': 'var(--background-warning)',
      },
    },
    plugins: [],
  }
}
