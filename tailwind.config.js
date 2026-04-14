import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                "on-secondary-fixed-variant": "#154d5f",
                "surface-container-highest": "#e3e2e0",
                "surface-dim": "#dbdad7",
                "surface": "#faf9f6",
                "surface-container-low": "#f4f3f1",
                "on-primary-fixed": "#000767",
                "outline-variant": "#c6c5d4",
                "on-surface": "#1a1c1a",
                "on-surface-variant": "#454652",
                "tertiary": "#0a1d24",
                "tertiary-fixed": "#d2e6ef",
                "tertiary-fixed-dim": "#b6cad2",
                "on-secondary": "#ffffff",
                "inverse-on-surface": "#f2f1ee",
                "on-primary-fixed-variant": "#343d96",
                "on-tertiary-fixed": "#0b1e24",
                "outline": "#767683",
                "on-tertiary": "#ffffff",
                "inverse-surface": "#2f312f",
                "surface-tint": "#4c56af",
                "secondary-fixed": "#bbe9ff",
                "on-background": "#1a1c1a",
                "primary-container": "#1a237e",
                "error-container": "#ffdad6",
                "secondary-container": "#b5e7fe",
                "on-secondary-container": "#37697d",
                "primary-fixed": "#e0e0ff",
                "on-error": "#ffffff",
                "on-primary": "#ffffff",
                "primary-fixed-dim": "#bdc2ff",
                "surface-container-lowest": "#ffffff",
                "background": "#faf9f6",
                "surface-bright": "#faf9f6",
                "surface-variant": "#e3e2e0",
                "on-tertiary-container": "#879aa2",
                "error": "#ba1a1a",
                "surface-container": "#efeeeb",
                "inverse-primary": "#bdc2ff",
                "tertiary-container": "#203239",
                "on-secondary-fixed": "#001f29",
                "primary": "#000666",
                "secondary": "#326578",
                "surface-container-high": "#e9e8e5",
                "secondary-fixed-dim": "#9ccee4",
                "on-tertiary-fixed-variant": "#374951",
                "on-error-container": "#93000a",
                "on-primary-container": "#8690ee"
            },
            borderRadius: {
                DEFAULT: "1rem",
                lg: "2rem",
                xl: "3rem",
                full: "9999px"
            },
            fontFamily: {
                headline: ["Newsreader"],
                body: ["Manrope"],
                label: ["Manrope"],
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            }
        },
    },

    plugins: [forms],
};
