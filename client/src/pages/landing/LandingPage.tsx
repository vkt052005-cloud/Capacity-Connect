import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Brain, Activity, UserCheck, ShieldCheck, BarChart3, Database } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-navy to-navy"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-1.5 border border-slate-700 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-cyan" />
            <span className="text-sm text-slate-300 font-medium">{t('hero_badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="block text-white mb-2">{t('hero_title_1')}</span>
            <span className="block gradient-text">{t('hero_title_2')}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/courses" className="btn-primary w-full sm:w-auto text-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              {t('cta_primary')}
            </Link>
            <Link to="/register?role=trainer" className="btn-outline w-full sm:w-auto text-center">
              {t('cta_outline')}
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="container mx-auto px-4 mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { val: t('metric_1_val'), label: t('metric_1_label') },
              { val: t('metric_2_val'), label: t('metric_2_label') },
              { val: t('metric_3_val'), label: t('metric_3_label') },
              { val: t('metric_4_val'), label: t('metric_4_label') },
            ].map((metric, i) => (
              <Card key={i} className="text-center p-6 bg-slate-900/50 backdrop-blur-sm border-slate-800/50 hover:border-cyan/30 transition-colors animate-slide-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{metric.val}</div>
                <div className="text-sm text-slate-400">{metric.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-navy-light relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t('features_title')}</h2>
            <div className="w-20 h-1 bg-cyan mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <BookOpen className="w-6 h-6" />, title: t('feature_1_title'), desc: t('feature_1_desc') },
              { icon: <Activity className="w-6 h-6" />, title: t('feature_2_title'), desc: t('feature_2_desc') },
              { icon: <Database className="w-6 h-6" />, title: t('feature_3_title'), desc: t('feature_3_desc') },
              { icon: <Brain className="w-6 h-6" />, title: t('feature_4_title'), desc: t('feature_4_desc') },
              { icon: <ShieldCheck className="w-6 h-6" />, title: t('feature_5_title'), desc: t('feature_5_desc') },
              { icon: <BarChart3 className="w-6 h-6" />, title: t('feature_6_title'), desc: t('feature_6_desc') },
            ].map((f, i) => (
              <Card key={i} className="group hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-cyan mb-6 group-hover:bg-cyan group-hover:text-navy transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Institutes Section */}
      <section className="py-20 border-y border-slate-800 bg-navy/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10">{t('institutes_title')}</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70">
            {/* Using text representations since logos are not available */}
            <div className="text-xl font-bold text-slate-400">IMD</div>
            <div className="text-xl font-bold text-slate-400">IITM</div>
            <div className="text-xl font-bold text-slate-400">INCOIS</div>
            <div className="text-xl font-bold text-slate-400">NCESS</div>
            <div className="text-xl font-bold text-slate-400">NCPOR</div>
            <div className="text-xl font-bold text-slate-400">NIOT</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan/10 to-indigo-500/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('cta_bottom_title')}</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">{t('cta_bottom_desc')}</p>
          <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
            {t('btn_register')}
            <UserCheck className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
