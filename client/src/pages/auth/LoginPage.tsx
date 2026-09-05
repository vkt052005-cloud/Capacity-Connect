import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate login for frontend UI only
    setTimeout(() => {
      login('fake-token', {
        id: '1',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'trainee',
        status: 'approved'
      });
      navigate('/trainee');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-navy">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">{t('login_title')}</h2>
        </div>
        
        <Card gradientBorder>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('login_email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                  placeholder="name@institute.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('login_pass')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              {t('login_submit')}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-400">
            {t('login_no_account')} <Link to="/register" className="font-medium text-cyan hover:text-cyan-bright">{t('btn_register')}</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
