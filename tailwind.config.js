/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./frontend/src/**/*.{js,jsx,ts,tsx}", // Include all files in src
        "./frontend/src/pages/**/*.{js,jsx,ts,tsx}", // Include files in pages
        "./frontend/src/hooks/**/*.{js,jsx,ts,tsx}" // Include files in hooks
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
