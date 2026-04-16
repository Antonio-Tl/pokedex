/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        mono: ['var(--font-mono)'],
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
      safelist: [
        'bg-green-500/15', 'text-green-700', 'border-green-500/30',
        'bg-red-500/15', 'text-red-700', 'border-red-500/30',
        'bg-blue-500/15', 'text-blue-700', 'border-blue-500/30',
        'bg-yellow-500/15', 'text-yellow-700', 'border-yellow-500/30',
        'bg-purple-500/15', 'text-purple-700', 'border-purple-500/30',
        'bg-pink-500/15', 'text-pink-700', 'border-pink-500/30',
        'bg-gray-500/15', 'text-gray-700', 'border-gray-500/30',
        'bg-orange-500/15', 'text-orange-700', 'border-orange-500/30',
        'bg-cyan-500/15', 'text-cyan-700', 'border-cyan-500/30',
        'bg-indigo-500/15', 'text-indigo-700', 'border-indigo-500/30',
        'bg-amber-500/15', 'text-amber-700', 'border-amber-500/30',
        'bg-emerald-500/15', 'text-emerald-700', 'border-emerald-500/30',
        'bg-rose-500/15', 'text-rose-700', 'border-rose-500/30',
        'bg-teal-500/15', 'text-teal-700', 'border-teal-500/30',
        'bg-lime-500/15', 'text-lime-700', 'border-lime-500/30',
        'bg-sky-500/15', 'text-sky-700', 'border-sky-500/30',
        'bg-stone-500/15', 'text-stone-700', 'border-stone-500/30',
        'bg-slate-500/15', 'text-slate-700', 'border-slate-500/30',
        'from-green-500/20', 'from-red-500/20', 'from-blue-500/20',
        'from-yellow-500/20', 'from-purple-500/20', 'from-pink-500/20',
        'from-gray-500/20', 'from-orange-500/20', 'from-cyan-500/20',
        'from-indigo-500/20', 'from-amber-500/20', 'from-emerald-500/20',
        'from-rose-500/20', 'from-teal-500/20', 'from-lime-500/20',
        'from-sky-500/20', 'from-stone-500/20', 'from-slate-500/20',
        'bg-green-500', 'bg-red-500', 'bg-blue-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-gray-500', 'bg-orange-500',
        'bg-cyan-500', 'bg-indigo-500', 'bg-amber-500', 'bg-emerald-500',
        'bg-rose-500', 'bg-teal-500', 'bg-lime-500', 'bg-sky-500',
        'bg-stone-500', 'bg-slate-500',
      ],
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
