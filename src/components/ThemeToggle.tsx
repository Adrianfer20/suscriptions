import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 p-0 flex items-center justify-center text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
      title={theme === 'light' ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      {theme === 'light' ? (
        <Moon size={20} className="transition-all" />
      ) : (
        <Sun size={20} className="transition-all" />
      )}
    </Button>
  )
}
