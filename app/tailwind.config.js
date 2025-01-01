const defaultConfig = require('tailwindcss/defaultConfig')
const formsPlugin = require('@tailwindcss/forms')

/** @type {import('tailwindcss/types').Config} */
const config = {
    darkMode: ['class'],
    content: ['index.html', "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
    	fontFamily: {
    		sans: [
    			'Inter',
                ...defaultConfig.theme.fontFamily.sans
            ]
    	},
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {}
    	}
    },
	experimental: { optimizeUniversalDefaults: true },
	plugins: [formsPlugin, require("tailwindcss-animate")]
}
module.exports = config
