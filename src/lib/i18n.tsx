import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type Language = 'en' | 'ru' | 'es';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.scanner': 'Scanner',
    'nav.arena': 'Arena',
    'nav.tournaments': 'Tournaments',
    'nav.rankings': 'Rankings',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login / Register',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    'nav.login_short': 'Login',
    'nav.logout_short': 'Logout',
    'nav.platform': 'Cybersecurity platform',
    'hero.title': 'Advanced Security Analysis',
    'hero.subtitle': 'Next-gen SQL Injection Detection & Code Review',
    'hero.cta': 'Analyze Now',
    'hero.disclaimer': 'User agrees not to use for malicious purposes. Project not responsible for misuse.',
    'dashboard.title': 'Security Operations Center',
    'scan.input.label': 'Target Code or URL',
    'scan.type.label': 'Scan Type',
    'scan.button': 'Initiate Scan',
    'scan.recent': 'Recent Operations',
    'stats.title': 'Vulnerability Statistics',
    'stats.safe': 'Safe Scans',
    'stats.total': 'Total Operations',
    'scan.scanning': 'SCANNING IN PROGRESS...',
    'privacy.title': 'Privacy Policy',
    'terms.title': 'Terms of Use',
    'footer.rights': '© 2026 SecOps Global. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact',
    'auth.required': 'Authorization required',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.courses': 'Курсы',
    'nav.scanner': 'Сканер',
    'nav.arena': 'Арена',
    'nav.tournaments': 'Турниры',
    'nav.rankings': 'Рейтинг',
    'nav.dashboard': 'Панель управления',
    'nav.login': 'Вход / Регистрация',
    'nav.logout': 'Выйти',
    'nav.profile': 'Профиль',
    'nav.login_short': 'Войти',
    'nav.logout_short': 'Выход',
    'nav.platform': 'Платформа кибербезопасности',
    'hero.title': 'Продвинутый Анализ Безопасности',
    'hero.subtitle': 'Обнаружение SQL-инъекций и анализ кода нового поколения',
    'hero.cta': 'Анализировать',
    'hero.disclaimer': 'Пользователь обязуется не использовать в злонамеренных целях. Проект не несет ответственности.',
    'dashboard.title': 'Центр Операций Безопасности',
    'scan.input.label': 'Целевой код или URL',
    'scan.type.label': 'Тип сканирования',
    'scan.button': 'Начать сканирование',
    'scan.recent': 'Недавние операции',
    'stats.title': 'Статистика уязвимостей',
    'stats.safe': 'Безопасные сканирования',
    'stats.total': 'Всего операций',
    'scan.scanning': 'СКАНИРОВАНИЕ...',
    'privacy.title': 'Политика конфиденциальности',
    'terms.title': 'Условия использования',
    'footer.rights': '© 2026 SecOps Global. Все права защищены.',
    'footer.privacy': 'Политика конфиденциальности',
    'footer.terms': 'Условия использования',
    'footer.contact': 'Контакты',
    'auth.required': 'Требуется авторизация',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.courses': 'Cursos',
    'nav.scanner': 'Escáner',
    'nav.arena': 'Arena',
    'nav.tournaments': 'Torneos',
    'nav.rankings': 'Ranking',
    'nav.dashboard': 'Panel de Control',
    'nav.login': 'Iniciar Sesión / Registro',
    'nav.logout': 'Cerrar Sesión',
    'nav.login_short': 'Iniciar sesión',
    'nav.logout_short': 'Cerrar sesión',
    'nav.platform': 'Plataforma de ciberseguridad',
    'hero.title': 'Análisis de Seguridad Avanzado',
    'hero.subtitle': 'Detección de inyección SQL y revisión de código de próxima generación',
    'hero.cta': 'Analizar Ahora',
    'hero.disclaimer': 'El usuario acepta no usarlo con fines maliciosos. El proyecto no es responsable del mal uso.',
    'dashboard.title': 'Centro de Operaciones de Seguridad',
    'scan.input.label': 'Código o URL objetivo',
    'scan.type.label': 'Tipo de Escaneo',
    'scan.button': 'Iniciar Escaneo',
    'scan.recent': 'Operaciones Recientes',
    'stats.title': 'Estadísticas de Vulnerabilidad',
    'stats.safe': 'Escaneos Seguros',
    'stats.total': 'Operaciones Totales',
    'scan.scanning': 'ESCANEA...',
    'privacy.title': 'Política de Privacidad',
    'terms.title': 'Términos de Uso',
    'footer.rights': '© 2026 SecOps Global. Todos los derechos reservados.',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.contact': 'Contacto',
    'auth.required': 'Se requiere autorización',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function loadInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem('secops.language') as Language | null;
    if (saved === 'en' || saved === 'ru' || saved === 'es') return saved;
  } catch {
    // ignore
  }
  return 'ru';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem('secops.language', lang);
    } catch {
      // ignore
    }
  };

  const t = useMemo(() => {
    return (key: string) => {
      return translations[language][key] || translations.en[key] || key;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
