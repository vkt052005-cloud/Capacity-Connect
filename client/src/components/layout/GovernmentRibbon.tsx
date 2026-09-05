import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function GovernmentRibbon() {
  const { t, setFontSize, lang, setLang } = useLanguage();

  return (
    <div className="bg-[#050a12] border-b border-slate-800 text-xs text-slate-400 py-1.5 px-4 flex justify-between items-center z-50 relative">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-green"></div>
        <span>{t('govt_ribbon')}</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex space-x-1">
          <button onClick={() => setFontSize('sm')} className="hover:text-cyan transition-colors" title="Decrease font size">A-</button>
          <button onClick={() => setFontSize('md')} className="hover:text-cyan transition-colors" title="Normal font size">A</button>
          <button onClick={() => setFontSize('lg')} className="hover:text-cyan transition-colors" title="Increase font size">A+</button>
        </div>
        <div className="w-px h-4 bg-slate-700"></div>
        <div className="flex space-x-2 font-medium">
          <button 
            onClick={() => setLang('en')} 
            className={`transition-colors ${lang === 'en' ? 'text-cyan' : 'hover:text-slate-200'}`}
          >
            English
          </button>
          <span>|</span>
          <button 
            onClick={() => setLang('hi')} 
            className={`transition-colors ${lang === 'hi' ? 'text-cyan' : 'hover:text-slate-200'}`}
          >
            हिन्दी
          </button>
        </div>
      </div>
    </div>
  );
}
