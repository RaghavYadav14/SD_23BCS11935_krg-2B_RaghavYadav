import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sgp_theme')
    const initialTheme = saved || 'dark'
    // Set initial theme on document immediately
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', initialTheme)
    }
    return initialTheme
  })

  useEffect(() => {
    localStorage.setItem('sgp_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

