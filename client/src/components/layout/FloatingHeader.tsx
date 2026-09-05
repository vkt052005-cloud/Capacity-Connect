import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Radar, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../ui/Button';

export default function FloatingHeader() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-navy/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-indigo-600 p-0.5">
            <div className="w-full h-full bg-navy rounded-[10px] flex items-center justify-center">
              <Radar className="w-6 h-6 text-cyan" />
            </div>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight tracking-wide">{t('site_name')}</div>
            <div className="text-[10px] text-cyan uppercase tracking-wider">{t('site_subtitle')}</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <NavLink to="/courses" className={({isActive}) => isActive ? 'text-cyan' : 'text-slate-300 hover:text-white transition-colors'}>{t('nav_courses')}</NavLink>
          <NavLink to="/competency" className={({isActive}) => isActive ? 'text-cyan' : 'text-slate-300 hover:text-white transition-colors'}>{t('nav_competency_map')}</NavLink>
          <NavLink to="/roles" className={({isActive}) => isActive ? 'text-cyan' : 'text-slate-300 hover:text-white transition-colors'}>{t('nav_role_desks')}</NavLink>
          <NavLink to="/verify" className={({isActive}) => isActive ? 'text-cyan' : 'text-slate-300 hover:text-white transition-colors'}>{t('nav_verify_certificate')}</NavLink>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                {t('btn_sign_in')}
              </Link>
              <Link to="/register" className="bg-white text-navy px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">
                {t('btn_register')}
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to={getDashboardLink()} className="flex items-center space-x-2 bg-slate-800 rounded-full px-3 py-1.5 hover:bg-slate-700 transition-colors">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-xs font-semibold text-slate-200 capitalize">{user.role}</span>
                <span className="text-sm text-white border-l border-slate-600 pl-2">{user.name}</span>
              </Link>
              <button onClick={logout} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
                {t('btn_logout')}
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-slate-300" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-navy-light border-b border-slate-800 px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link to="/courses" className="text-slate-300" onClick={() => setMenuOpen(false)}>{t('nav_courses')}</Link>
            <Link to="/verify" className="text-slate-300" onClick={() => setMenuOpen(false)}>{t('nav_verify_certificate')}</Link>
          </nav>
          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
            {!user ? (
              <>
                <Link to="/login" className="text-slate-300 text-center" onClick={() => setMenuOpen(false)}>{t('btn_sign_in')}</Link>
                <Link to="/register" className="bg-white text-navy py-2 rounded-full text-center font-bold" onClick={() => setMenuOpen(false)}>{t('btn_register')}</Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()} className="text-cyan text-center font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-red-400 text-center">{t('btn_logout')}</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
