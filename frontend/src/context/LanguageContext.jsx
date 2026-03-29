import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

// Простые переводы для начала (потом можно вынести в отдельные JSON файлы)
export const translations = {
  RU: {
    nav_home: 'Главная',
    nav_events: 'Мероприятия',
    nav_teams: 'Команды',
    nav_news: 'Новости',
    nav_profile: 'Профиль',
    btn_register: 'Зарегистрироваться',
    menu_profile: '👤 Мой профиль',
    menu_dev: '🛠️ Панель разработчика',
    menu_team: '🛡️ Управление командой',
    menu_logout: '🚪 Выйти',
    footer_rights: '© 2026 Jas Volunteers. Все права защищены.',
    footer_bug: 'Сообщить об ошибке 🐛',
    footer_support: 'Поддержать проект ❤️'
  },
  KZ: {
    nav_home: 'Басты бет',
    nav_events: 'Іс-шаралар',
    nav_teams: 'Командалар',
    nav_news: 'Жаңалықтар',
    nav_profile: 'Профиль',
    btn_register: 'Тіркелу',
    menu_profile: '👤 Менің профилім',
    menu_dev: '🛠️ Әзірлеуші тақтасы',
    menu_team: '🛡️ Команданы басқару',
    menu_logout: '🚪 Шығу',
    footer_rights: '© 2026 Jas Volunteers. Барлық құқықтар қорғалған.',
    footer_bug: 'Қатені хабарлау 🐛',
    footer_support: 'Жобаны қолдау ❤️'
  },
  EN: {
    nav_home: 'Home',
    nav_events: 'Events',
    nav_teams: 'Teams',
    nav_news: 'News',
    nav_profile: 'Profile',
    btn_register: 'Sign Up',
    menu_profile: '👤 My Profile',
    menu_dev: '🛠️ Developer Panel',
    menu_team: '🛡️ Manage Team',
    menu_logout: '🚪 Logout',
    footer_rights: '© 2026 Jas Volunteers. All rights reserved.',
    footer_bug: 'Report a bug 🐛',
    footer_support: 'Support the project ❤️'
  }
}

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
