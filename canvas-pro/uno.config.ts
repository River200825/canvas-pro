import { defineConfig, presetUno, presetAttributify, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class',
    }),
    presetAttributify(),
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      canvas: {
        bg: '#f8fafc',
        block: '#ffffff',
        border: '#e2e8f0',
        note: '#fef08a',
      },
      dark: {
        canvas: {
          bg: '#0f172a',
          block: '#1e293b',
          border: '#334155',
          note: '#fef08a',
        },
      },
    },
    spacing: {
      '18': '4.5rem',
      '88': '22rem',
      '128': '32rem',
    },
    boxShadow: {
      'note': '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
      'note-hover': '0 8px 24px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.12)',
      'note-drag': '0 20px 40px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.15)',
      'block': '0 1px 3px rgba(0,0,0,0.06)',
    },
    animation: {
      'fade-in': 'fadeIn 150ms ease-out',
      'slide-up': 'slideUp 200ms ease-out',
      'scale-in': 'scaleIn 100ms ease-out',
    },
    keyframes: {
      fadeIn: '{from{opacity:0}to{opacity:1}}',
      slideUp: '{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
      scaleIn: '{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}',
    },
  },
  shortcuts: {
    'btn': 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    'btn-secondary': 'btn bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    'btn-ghost': 'btn bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    'btn-icon': 'btn p-2',
    'btn-icon-sm': 'btn p-1.5',
    'input': 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500',
    'card': 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700',
    'dropdown-item': 'flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer',
  },
  rules: [
    ['scrollbar-hide', { 'scrollbar-width': 'none', '-ms-overflow-style': 'none' }],
  ],
  safelist: [
    'bg-yellow-300', 'bg-blue-300', 'bg-green-300', 'bg-pink-300', 'bg-orange-300', 'bg-purple-300', 'bg-gray-300',
    'dark:bg-yellow-900', 'dark:bg-blue-900', 'dark:bg-green-900', 'dark:bg-pink-900', 'dark:bg-orange-900', 'dark:bg-purple-900', 'dark:bg-gray-700',
    'border-yellow-400', 'border-blue-400', 'border-green-400', 'border-pink-400', 'border-orange-400', 'border-purple-400', 'border-gray-400',
    'dark:border-yellow-600', 'dark:border-blue-600', 'dark:border-green-600', 'dark:border-pink-600', 'dark:border-orange-600', 'dark:border-purple-600', 'dark:border-gray-500',
  ],
})