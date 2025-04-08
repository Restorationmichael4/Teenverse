/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./frontend/src/**/*.{js,jsx,ts,tsx}", // Include all JS/TS/JSX/TSX files in frontend/src
        "./frontend/src/pages/**/*.{js,jsx,ts,tsx}", // Include files in pages folder
        "./frontend/src/hooks/**/*.{js,jsx,ts,tsx}"  // Include files in hooks folder
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
