import React, { useState, useEffect } from 'react';
import { Download, Users, Award, TrendingUp, Filter } from 'lucide-react';
import { api } from '../../utils/api';
import { Course, Assessment, Submission } from '../../types';

const CohortGradebook: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  
  const [sortField, setSortField] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchAssessments();
    else { setAssessments([]); setSelectedAssessment(''); }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedAssessment) fetchSubmissions();
    else setSubmissions([]);
  }, [selectedAssessment]);

  const fetchCourses = async () => {
    try {
      const data = await api.get<any[]>('/courses?trainer=me');
      setCourses(data || [{ id: '1', title: 'Advanced NWP', batch_code: 'B-101', description: '', domain: '', level: 'Advanced', modules: [], trainerId: '1', deliveryMode: '', duration: '', enrolledCount: 0, max_capacity: 50, start_date: '', end_date: '', status: 'active', created_at: '' }]);
    } catch (e) { console.error(e); }
  };

  const fetchAssessments = async () => {
    try {
      const data = await api.get<Assessment[]>(`/assessments?courseId=${selectedCourse}`);
      setAssessments(data || [{ id: 'a1', courseId: '1', moduleId: '', title: 'Mid-term Quiz', questions: [], timeLimit: 30, passingScore: 60, createdAt: '', updatedAt: '' } as any]);
    } catch (e) { console.error(e); }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await api.get<any[]>(`/assessments/${selectedAssessment}/results`);
      // Mock data
      setSubmissions(data || [
        { id: 's1', assessmentId: 'a1', user_id: 'u1', answers: [], score: 85, total_marks: 100, submitted_at: '2026-09-01T10:00:00Z', passed: true },
        { id: 's2', assessmentId: 'a1', user_id: 'u2', answers: [], score: 45, total_marks: 100, submitted_at: '2026-09-01T11:30:00Z', passed: false }
      ]);
    } catch (e) { console.error(e); }
  };

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];
    if (sortField === 'percentage') {
      valA = (a.score / a.total_marks) * 100;
      valB = (b.score / b.total_marks) * 100;
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const exportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['S.No', 'Trainee ID', 'Submission Date', 'Score', 'Total', 'Percentage', 'Status'];
    const rows = sortedSubmissions.map((s, i) => [
      i + 1, s.user_id, new Date(s.submitted_at).toLocaleDateString(), s.score, s.total_marks, 
      `${((s.score / s.total_marks) * 100).toFixed(1)}%`, s.passed ? 'Pass' : 'Fail'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradebook_export.csv';
    a.click();
  };

  const currentAssessment = assessments.find(a => a.id === selectedAssessment);
  const avgScore = submissions.length ? (submissions.reduce((acc, s) => acc + (s.score/s.total_marks)*100, 0) / submissions.length) : 0;
  const passCount = submissions.filter(s => s.passed).length;
  const passRate = submissions.length ? (passCount / submissions.length) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="text-cyan-400" /> Cohort Gradebook
        </h1>
        <button onClick={exportCSV} className="bg-[#111C30] hover:bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-5 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-1">Select Course</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white">
            <option value="">-- Choose Course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-1">Select Assessment</label>
          <select value={selectedAssessment} onChange={e => setSelectedAssessment(e.target.value)} disabled={!selectedCourse} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white disabled:opacity-50">
            <option value="">-- Choose Assessment --</option>
            {assessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
      </div>

      {selectedAssessment && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 text-blue-400 rounded-lg"><Users size={24} /></div>
              <div><p className="text-sm text-gray-400">Submissions</p><p className="text-xl font-bold text-white">{submissions.length}</p></div>
            </div>
            <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 bg-green-900/30 text-green-400 rounded-lg"><TrendingUp size={24} /></div>
              <div><p className="text-sm text-gray-400">Pass Rate</p><p className="text-xl font-bold text-white">{passRate.toFixed(1)}%</p></div>
            </div>
            <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-900/30 text-purple-400 rounded-lg"><Award size={24} /></div>
              <div><p className="text-sm text-gray-400">Average Score</p><p className="text-xl font-bold text-white">{avgScore.toFixed(1)}%</p></div>
            </div>
          </div>

          <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111C30] border-b border-gray-800 text-sm text-gray-400">
                    <th className="p-4 font-medium">S.No</th>
                    <th className="p-4 font-medium">Trainee</th>
                    <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('submitted_at')}>Date</th>
                    <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('score')}>Score</th>
                    <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('percentage')}>%</th>
                    <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('passed')}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubmissions.length > 0 ? sortedSubmissions.map((sub, idx) => {
                    const percentage = (sub.score / sub.total_marks) * 100;
                    return (
                      <tr key={sub.id} className={`border-b border-gray-800/50 hover:bg-[#111C30]/50 transition-colors ${sub.passed ? 'bg-green-900/5' : 'bg-red-900/5'}`}>
                        <td className="p-4 text-sm">{idx + 1}</td>
                        <td className="p-4 text-sm font-medium">{sub.user_id}</td>
                        <td className="p-4 text-sm text-gray-400">{new Date(sub.submitted_at).toLocaleString()}</td>
                        <td className="p-4 text-sm">{sub.score} / {sub.total_marks}</td>
                        <td className="p-4 text-sm">{percentage.toFixed(1)}%</td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${sub.passed ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-red-900/40 text-red-400 border border-red-800'}`}>
                            {sub.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">No submissions yet for this assessment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CohortGradebook;
