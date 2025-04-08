/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // Include all files in src
        "./src/pages/**/*.{js,jsx,ts,tsx}", // Include files in pages
        "./src/hooks/**/*.{js,jsx,ts,tsx}" // Include files in hooks
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
