import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<'trainee' | 'trainer'>(searchParams.get('role') as any || 'trainee');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate register
    setTimeout(() => {
      alert('Registration successful. Pending approval.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">{t('register_title')}</h2>
        </div>
        
        <Card gradientBorder>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex gap-4 p-1 bg-slate-800 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setRole('trainee')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'trainee' ? 'bg-cyan text-navy' : 'text-slate-400 hover:text-white'}`}
              >
                {t('register_role_trainee')}
              </button>
              <button
                type="button"
                onClick={() => setRole('trainer')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'trainer' ? 'bg-cyan text-navy' : 'text-slate-400 hover:text-white'}`}
              >
                {t('register_role_trainer')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('register_name')}</label>
                <input type="text" required className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-cyan focus:border-cyan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('login_email')}</label>
                <input type="email" required className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-cyan focus:border-cyan" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('register_institute')}</label>
              <select required className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-cyan focus:border-cyan">
                <option value="">Select Institute</option>
                <option value="imd">IMD</option>
                <option value="iitm">IITM</option>
                <option value="incois">INCOIS</option>
                <option value="ncess">NCESS</option>
                <option value="ncpor">NCPOR</option>
                <option value="niot">NIOT</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('login_pass')}</label>
                <input type="password" required className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-cyan focus:border-cyan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('register_pass_confirm')}</label>
                <input type="password" required className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-cyan focus:border-cyan" />
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              {t('register_submit')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {t('register_has_account')} <Link to="/login" className="font-medium text-cyan hover:text-cyan-bright">{t('btn_sign_in')}</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
