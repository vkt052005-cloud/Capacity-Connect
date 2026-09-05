import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { api } from '../../utils/api';

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Mock fetching data
    setData({
      metrics: {
        totalOfficers: 1250,
        activeCourses: 45,
        activeBatches: 12,
        competencyRate: 78
      },
      institutes: [
        { name: 'IMD', officers: 450, courses: 15, rate: 82, color: 'border-blue-500' },
        { name: 'INCOIS', officers: 320, courses: 10, rate: 76, color: 'border-cyan-500' },
        { name: 'NCMRWF', officers: 180, courses: 8, rate: 85, color: 'border-green-500' },
        { name: 'IITM Pune', officers: 150, courses: 6, rate: 79, color: 'border-purple-500' },
        { name: 'NIOT', officers: 90, courses: 4, rate: 71, color: 'border-yellow-500' },
        { name: 'CMLRE', officers: 60, courses: 2, rate: 88, color: 'border-red-500' }
      ],
      domains: [
        { name: 'Meteorology', count: 500, percent: 100 },
        { name: 'Oceanography', count: 350, percent: 70 },
        { name: 'Seismology', count: 200, percent: 40 },
        { name: 'Climate Science', count: 200, percent: 40 }
      ]
    });
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-cyan-400" /> Executive Analytics
        </h1>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Officers Trained', value: data.metrics.totalOfficers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Active Courses', value: data.metrics.activeCourses, icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
          { label: 'Active Batches', value: data.metrics.activeBatches, icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Competency Rate', value: `${data.metrics.competencyRate}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' }
        ].map((m, i) => (
          <div key={i} className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-6 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${m.bg}`}>
              <m.icon className={m.color} size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">{m.label}</p>
              <h3 className="text-2xl font-bold text-white">{m.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Institute Stats */}
        <div className="lg:col-span-2 bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Institute-wise Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.institutes.map((inst: any, i: number) => (
              <div key={i} className={`bg-[#111C30] border border-gray-800 rounded-lg p-4 border-l-4 ${inst.color}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">{inst.name}</h3>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{inst.rate}% Rate</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400 mt-2">
                  <span className="flex items-center gap-1"><Users size={14}/> {inst.officers} Officers</span>
                  <span className="flex items-center gap-1"><BookOpen size={14}/> {inst.courses} Courses</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-1 bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-cyan-400"/> Enrollment by Domain
          </h2>
          <div className="space-y-6">
            {data.domains.map((dom: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{dom.name}</span>
                  <span className="text-gray-400">{dom.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" 
                    style={{ width: `${dom.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Monthly Training Progress</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {[40, 65, 45, 80, 55, 90, 75].map((val, i) => (
                <div key={i} className="w-full bg-gray-800 rounded-t relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-sky-500 rounded-t transition-all group-hover:bg-sky-400"
                    style={{ height: `${val}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
