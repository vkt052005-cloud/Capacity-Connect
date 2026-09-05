import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translateFn } from '../utils/translations';

type FontSize = 'sm' | 'md' | 'lg';
type Language = 'en' | 'hi';

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<FontSize>('md');

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'sm') root.style.fontSize = '14px';
    else if (fontSize === 'md') root.style.fontSize = '16px';
    else if (fontSize === 'lg') root.style.fontSize = '18px';
  }, [fontSize]);

  const t = (key: string) => translateFn(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, fontSize, setFontSize, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
