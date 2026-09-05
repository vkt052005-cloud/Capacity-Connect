import React, { useState, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, FileText, Video, Trash2, Database, Book } from 'lucide-react';
import { api } from '../../utils/api';
import { Course, Resource } from '../../types';

const ResourceUploader: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    title: '',
    type: 'pdf',
    url: '',
    description: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchResources();
    } else {
      setResources([]);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const data = await api.get<any[]>('/courses?trainer=me');
      setCourses(data || [{ id: '1', title: 'Advanced NWP', batch_code: 'B-101' }]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResources = async () => {
    try {
      const data = await api.get<any[]>(`/resources?courseId=${selectedCourse}`);
      setResources(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return alert('Select course');
    try {
      const res = await api.post<any>('/resources', { ...form, course_id: selectedCourse });
      if (res) setResources([...resources, res]);
      else {
        // mock
        setResources([...resources, { id: Date.now().toString(), course_id: selectedCourse, ...form, created_at: new Date().toISOString() }]);
      }
      setForm({ title: '', type: 'pdf', url: '', description: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="text-purple-400" size={20} />;
      case 'dataset': return <Database className="text-cyan-400" size={20} />;
      case 'manual': return <Book className="text-green-400" size={20} />;
      default: return <FileText className="text-red-400" size={20} />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-gray-200">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <UploadCloud className="text-cyan-400" /> Resource Manager
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-5">
            <label className="block text-sm text-gray-400 mb-2">Select Course</label>
            <select 
              value={selectedCourse} 
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="">-- Choose --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <form onSubmit={handleAdd} className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-5 space-y-4 opacity-100 transition-opacity" style={{ opacity: selectedCourse ? 1 : 0.5, pointerEvents: selectedCourse ? 'auto' : 'none' }}>
            <h3 className="text-lg font-medium text-white mb-2">Upload New Resource</h3>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Title</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white text-sm">
                <option value="pdf">PDF Document</option>
                <option value="video">Video Link</option>
                <option value="dataset">Dataset</option>
                <option value="manual">Lab Manual</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400">URL / Path</label>
              <div className="flex relative">
                <LinkIcon className="absolute left-3 top-2.5 text-gray-500" size={16} />
                <input required value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 pl-9 text-white text-sm" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white text-sm h-20" />
            </div>

            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2">
              <UploadCloud size={18} /> Add Resource
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-5 min-h-[500px]">
            <h3 className="text-lg font-medium text-white mb-4">Course Materials</h3>
            
            {!selectedCourse ? (
              <div className="text-center py-20 text-gray-500">Select a course to view its resources.</div>
            ) : resources.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No resources added yet.</div>
            ) : (
              <div className="space-y-3">
                {resources.map(res => (
                  <div key={res.id} className="flex items-start gap-4 p-4 bg-[#111C30] border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      {getIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{res.title}</h4>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{res.description}</p>
                      <a href={res.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline mt-2 inline-block truncate max-w-full">
                        {res.url}
                      </a>
                    </div>
                    <button onClick={() => handleDelete(res.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceUploader;
