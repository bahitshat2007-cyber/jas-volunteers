import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../translations.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  // Ищем сохраненный язык в LocalStorage, по умолчанию RU
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('jas_lang') || 'RU'
  })

  // При изменении языка сохраняем в LocalStorage
  useEffect(() => {
    localStorage.setItem('jas_lang', lang)
    // Также можно менять атрибут lang у html для скринридеров
    document.documentElement.lang = lang.toLowerCase()
  }, [lang])

  // Функция для получения перевода по ключу
  const t = (key) => {
    return translations[lang][key] || translations['RU'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
