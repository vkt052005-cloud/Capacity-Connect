import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Search, QrCode, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyCertificatePage() {
  const { t } = useLanguage();
  const [certId, setCertId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus(certId.includes('9821') ? 'success' : 'error');
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-4">{t('verify_title')}</h1>
        <p className="text-slate-400">Verify the authenticity of MoES capacity building certificates securely via our blockchain registry.</p>
      </div>

      <Card className="mb-8">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder={t('verify_search_ph')}
              className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
            />
          </div>
          <Button type="submit" isLoading={status === 'loading'} className="whitespace-nowrap">
            {t('verify_btn')}
          </Button>
          <Button type="button" variant="outline" className="whitespace-nowrap flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            {t('verify_qr')}
          </Button>
        </form>
      </Card>

      {status === 'success' && (
        <Card className="border-green-500/30 bg-green-900/10 animate-fade-in text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-400 mb-2">{t('verify_success')}</h3>
          <div className="text-white text-lg font-medium mb-6">Dr. Rajesh Kumar</div>
          <div className="bg-slate-900 rounded-lg p-6 inline-block text-left border border-slate-800">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="text-slate-400">Course:</div>
              <div className="font-semibold text-white">Advanced Radar Meteorology</div>
              <div className="text-slate-400">Issuer:</div>
              <div className="font-semibold text-white">IMD Academy</div>
              <div className="text-slate-400">Date:</div>
              <div className="font-semibold text-white">Aug 15, 2026</div>
              <div className="text-slate-400">ID:</div>
              <div className="font-mono text-cyan">{certId}</div>
            </div>
          </div>
        </Card>
      )}

      {status === 'error' && (
        <Card className="border-red-500/30 bg-red-900/10 animate-fade-in text-center p-8">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-400 mb-2">{t('verify_error')}</h3>
          <p className="text-slate-300">The certificate ID you entered does not match any records in our registry. Please check the ID and try again.</p>
        </Card>
      )}
    </div>
  );
}
