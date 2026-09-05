import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#050a12] border-t border-slate-800 pt-12 pb-6 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-2">{t('site_name')}</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-4">
              {t('hero_subtitle')}
            </p>
            <div className="text-cyan text-sm font-medium">
              {t('footer_dev')}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer_quick_links')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/courses" className="hover:text-cyan transition-colors">{t('nav_courses')}</Link></li>
              <li><Link to="/verify" className="hover:text-cyan transition-colors">{t('nav_verify_certificate')}</Link></li>
              <li><Link to="/login" className="hover:text-cyan transition-colors">{t('btn_sign_in')}</Link></li>
              <li><Link to="/register" className="hover:text-cyan transition-colors">{t('btn_register')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer_contact')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Ministry of Earth Sciences</li>
              <li>Prithvi Bhavan, Lodhi Road</li>
              <li>New Delhi - 110003</li>
              <li>support@moes.gov.in</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>{t('footer_copy')}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
