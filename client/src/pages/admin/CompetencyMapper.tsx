import React, { useState } from 'react';
import { Search, UserCircle, Star, Award, ChevronRight, Briefcase } from 'lucide-react';
import { api } from '../../utils/api';

const CompetencyMapper: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const allTags = [
    { name: 'Doppler Radar', count: 12 },
    { name: 'WRF Modeling', count: 8 },
    { name: 'Numerical Weather Prediction', count: 15 },
    { name: 'Seismology', count: 6 },
    { name: 'Oceanography', count: 20 },
    { name: 'Satellite Meteorology', count: 14 },
    { name: 'Climate Modeling', count: 11 },
    { name: 'Marine Biology', count: 5 },
    { name: 'Tsunami Warning', count: 4 },
    { name: 'Cyclone Tracking', count: 9 }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setResults([
        { id: '1', name: 'Dr. Arun Kumar', institute: 'IMD', experienceYears: 18, batches: 24, score: 95, tags: ['Doppler Radar', 'Numerical Weather Prediction', 'Satellite Meteorology'] },
        { id: '2', name: 'Dr. Sunita Sharma', institute: 'IITM Pune', experienceYears: 12, batches: 15, score: 88, tags: ['Numerical Weather Prediction', 'Climate Modeling'] },
        { id: '3', name: 'Prof. Rajesh Singh', institute: 'INCOIS', experienceYears: 22, batches: 30, score: 82, tags: ['Oceanography', 'WRF Modeling'] }
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-gray-200">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-white">Find Best Trainers</h1>
        <p className="text-gray-400">Intelligent competency mapping engine to match domain experts with training requirements.</p>
        
        <form onSubmit={handleSearch} className="relative mt-6 max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="E.g. Doppler Radar, NWP, Climate Modeling..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0C1526] border border-cyan-900/50 rounded-xl pl-12 pr-4 py-3 text-white focus:border-cyan-400 outline-none transition-colors shadow-[0_0_15px_rgba(34,211,238,0.1)] focus:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-semibold text-white">Top 3 Recommended Trainers for "{searchTerm}"</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((trainer, idx) => {
              const rankColors = [
                'from-yellow-500 to-yellow-300 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]', // Gold
                'from-gray-400 to-gray-200 border-gray-400/50 shadow-[0_0_15px_rgba(156,163,175,0.2)]',     // Silver
                'from-orange-700 to-orange-500 border-orange-700/50 shadow-[0_0_15px_rgba(194,65,12,0.2)]' // Bronze
              ];
              
              return (
                <div key={trainer.id} className="bg-[#0C1526] rounded-xl relative overflow-hidden flex flex-col h-full border border-[rgba(148,163,184,0.1)] hover:border-cyan-900/50 transition-colors">
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${rankColors[idx].split(' ')[0]} ${rankColors[idx].split(' ')[1]}`} />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                          <UserCircle size={32} className="text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{trainer.name}</h3>
                          <p className="text-xs text-cyan-400">{trainer.institute}</p>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${rankColors[idx].split(' ')[0]} ${rankColors[idx].split(' ')[1]} ${rankColors[idx].split(' ')[2]}`}>
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Match Score</span>
                          <span className="text-white font-bold">{trainer.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${trainer.score}%` }} />
                        </div>
                      </div>

                      <div className="flex gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Briefcase size={14}/> {trainer.experienceYears} Yrs Exp</span>
                        <span className="flex items-center gap-1"><Award size={14}/> {trainer.batches} Batches</span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Matching Competencies:</p>
                        <div className="flex flex-wrap gap-2">
                          {trainer.tags.map((t: string) => (
                            <span key={t} className="px-2 py-1 bg-cyan-900/20 border border-cyan-900/50 rounded text-xs text-cyan-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-800 flex gap-2">
                      <button className="flex-1 bg-[#111C30] hover:bg-gray-800 text-white text-sm py-2 rounded transition-colors">
                        View Profile
                      </button>
                      <button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm py-2 rounded transition-colors">
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-800/50">
        <h2 className="text-xl font-semibold text-white mb-6">Competency Directory</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allTags.map(tag => (
            <button 
              key={tag.name}
              onClick={() => { setSearchTerm(tag.name); handleSearch({ preventDefault: () => {} } as any); }}
              className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-lg p-4 hover:border-cyan-500/50 transition-colors text-left group"
            >
              <h3 className="text-sm font-medium text-gray-200 group-hover:text-cyan-400 transition-colors line-clamp-1">{tag.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{tag.count} Trainers</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetencyMapper;
