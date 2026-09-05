import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Save, BookOpen } from 'lucide-react';
import { api } from '../../utils/api';
import { Course, Question } from '../../types';

const AssessmentBuilder: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [details, setDetails] = useState({
    title: '',
    timeLimit: 30,
    passingScore: 60,
    deadline: ''
  });
  
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await api.get<any[]>('/courses?trainer=me');
      setCourses(data || [
        { id: '1', title: 'Advanced NWP', description: '', domain: '', level: 'Advanced', modules: [], trainerId: '1', batch_code: 'B-101', deliveryMode: '', duration: '', enrolledCount: 0, max_capacity: 50, start_date: '', end_date: '', status: 'active', created_at: '' }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        marks: 1,
        sort_order: questions.length + 1
      } as any
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions] as any[];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedCourse) return alert('Select a course first');
    try {
      await api.post('/assessments', {
        courseId: selectedCourse,
        ...details,
        questions
      });
      alert('Assessment created successfully!');
      setQuestions([]);
      setDetails({ title: '', timeLimit: 30, passingScore: 60, deadline: '' });
    } catch (e) {
      console.error(e);
      alert('Error creating assessment');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-cyan-400" /> Assessment Builder
        </h1>
        <button 
          onClick={handleSave}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save size={18} /> Create Assessment
        </button>
      </div>

      <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Target Course</label>
            <select 
              value={selectedCourse} 
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="">-- Select Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.batch_code})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Assessment Title</label>
            <input 
              type="text" 
              value={details.title}
              onChange={e => setDetails({...details, title: e.target.value})}
              className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white"
              placeholder="e.g. Mid-term Quiz"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Time Limit (mins)</label>
            <input 
              type="number" 
              value={details.timeLimit}
              onChange={e => setDetails({...details, timeLimit: parseInt(e.target.value)})}
              className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Passing Score (%)</label>
            <input 
              type="number" 
              value={details.passingScore}
              onChange={e => setDetails({...details, passingScore: parseInt(e.target.value)})}
              className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Questions ({questions.length})</h2>
          <button 
            onClick={addQuestion}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm bg-cyan-900/20 px-3 py-1.5 rounded"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>

        {questions.map((q: any, qIndex) => (
          <div key={qIndex} className="bg-[#0C1526] border border-gray-800 rounded-xl p-5 relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-300 p-1">
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-none w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-300">
                {qIndex + 1}
              </div>
              <div className="flex-1 space-y-4">
                <textarea 
                  value={q.question_text}
                  onChange={e => updateQuestion(qIndex, 'question_text', e.target.value)}
                  placeholder="Enter question text here..."
                  className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white h-20 resize-y"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((optLetter) => (
                    <div key={optLetter} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name={`correct-${qIndex}`}
                        checked={q.correct_option === optLetter}
                        onChange={() => updateQuestion(qIndex, 'correct_option', optLetter)}
                        className="w-4 h-4 text-cyan-500 focus:ring-cyan-500 bg-gray-800 border-gray-600"
                      />
                      <input 
                        type="text"
                        value={q[`option_${optLetter.toLowerCase()}`]}
                        onChange={e => updateQuestion(qIndex, `option_${optLetter.toLowerCase()}`, e.target.value)}
                        placeholder={`Option ${optLetter}`}
                        className="flex-1 bg-[#111C30] border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 w-32">
                  <label className="text-sm text-gray-400">Marks:</label>
                  <input 
                    type="number"
                    min="1"
                    value={q.marks}
                    onChange={e => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                    className="w-full bg-[#111C30] border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentBuilder;
