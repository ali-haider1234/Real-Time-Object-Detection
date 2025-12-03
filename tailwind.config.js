/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0a0a0f',
                    card: '#1a1a24',
                    border: '#2a2a3a',
                },
                accent: {
                    teal: '#14b8a6',
                    cyan: '#06b6d4',
                    green: '#10b981',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'xl': '18px',
                '2xl': '24px',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite',
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)' },
                    '50%': { boxShadow: '0 0 30px rgba(20, 184, 166, 0.8)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
