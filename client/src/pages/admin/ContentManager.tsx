import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Globe, Eye, Monitor } from 'lucide-react';
import { api } from '../../utils/api';
import { Announcement } from '../../types';

const ContentManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickerAnnouncement, setTickerAnnouncement] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'notice' as 'notice' | 'achievement' | 'update',
    is_active: true
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await api.get<any[]>('/admin/announcements');
      setAnnouncements(data || [
        { id: '1', title: 'New Advanced NWP Course Open', content: 'Enrollment starts Monday.', type: 'update', is_active: true, created_at: '', created_by: 'admin' },
        { id: '2', title: 'Scheduled Maintenance', content: 'System down this weekend.', type: 'notice', is_active: false, created_at: '', created_by: 'admin' }
      ]);
      setTickerAnnouncement('1');
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAnn = await api.post<any>('/admin/announcements', form);
      setAnnouncements([newAnn || { id: Date.now().toString(), ...form, created_at: '', created_by: 'admin' } as any, ...announcements]);
      setShowModal(false);
      setForm({ title: '', content: '', type: 'notice', is_active: true });
    } catch (e) { console.error(e); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !current } : a));
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="text-cyan-400" /> Content Manager
        </h1>
      </div>

      <div className="bg-[#0C1526] border border-cyan-900/30 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Monitor className="text-cyan-400" size={20} /> Live Ticker Manager
        </h2>
        <div className="space-y-4">
          <div className="p-3 bg-gray-900 rounded border border-gray-800 flex items-center overflow-hidden">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase mr-3 whitespace-nowrap">Latest Update</span>
            <div className="text-sm text-cyan-400 animate-pulse">
              {announcements.find(a => a.id === tickerAnnouncement)?.title || "Select an announcement to display here"}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Select active ticker content:</label>
            <select 
              value={tickerAnnouncement} 
              onChange={e => setTickerAnnouncement(e.target.value)}
              className="flex-1 bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="">-- None --</option>
              {announcements.filter(a => a.is_active).map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Megaphone className="text-cyan-400" size={20} /> Announcements
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map(ann => (
          <div key={ann.id} className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-5 flex flex-col h-full relative group">
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => toggleActive(ann.id, ann.is_active)} className={`p-1.5 rounded-full ${ann.is_active ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'} hover:bg-gray-700`} title="Toggle Visibility">
                <Eye size={16} />
              </button>
              <button className="p-1.5 rounded-full bg-blue-900/30 text-blue-400 hover:bg-blue-900/50" title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => deleteAnnouncement(ann.id)} className="p-1.5 rounded-full bg-red-900/30 text-red-400 hover:bg-red-900/50" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="mb-2">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                ann.type === 'notice' ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
                ann.type === 'achievement' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' : 
                'bg-blue-900/30 text-blue-400 border border-blue-800/50'
              }`}>
                {ann.type}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 pr-24">{ann.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{ann.content}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0C1526] border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#0C1526] z-10">
              <h2 className="text-xl font-bold text-white">New Announcement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handlePublish} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white">
                  <option value="notice">Notice</option>
                  <option value="update">Update</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Content</label>
                <textarea required value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white h-24" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 bg-gray-800 border-gray-600 rounded" />
                <label htmlFor="isActive" className="text-sm text-gray-300">Publish immediately</label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
