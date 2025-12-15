/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: '#F9F8F6',
                surface: '#FFFFFF',
                primary: '#1A1A1A',
                secondary: '#595959',
                accent: {
                    DEFAULT: '#5F6F52',
                    dark: '#3A4A30',
                    light: '#A9B388',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            },
            container: {
                center: true,
                padding: '1.5rem',
                screens: {
                    '2xl': '1200px',
                },
            },
        },
    },
    plugins: [],
}
