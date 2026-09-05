import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Mail, Building, BookOpen, Users, 
  FileText, Award, Edit2, Plus, Calendar, Clock,
  Briefcase, Save, X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { User, Course } from '../../types';

interface TrainerProfile extends User {
  specializations: string[];
  bio: string;
  experienceYears: number;
}

const FacultyStudio: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [bio, setBio] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', domain: 'Meteorology',
    level: 'Beginner', deliveryMode: 'Online', duration: '',
    batch_code: '', start_date: '', end_date: '', max_capacity: 50
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await api.get<TrainerProfile>('/profile');
      const coursesData = await api.get<Course[]>('/courses?trainer=me');
      
      setProfile(profileData || {
        id: user?.id || '1',
        name: user?.name || 'Dr. Scientist',
        email: user?.email || 'trainer@moes.gov.in',
        role: 'trainer',
        institute_id: 'IMD',
        specializations: ['Climate Modeling', 'Data Analysis'],
        bio: 'Senior researcher specializing in climate dynamics.',
        experienceYears: 15,
        isActive: true,
        created_at: new Date().toISOString()
      });
      setBio(profileData?.bio || 'Senior researcher specializing in climate dynamics.');
      setTags(profileData?.specializations || ['Climate Modeling', 'Data Analysis']);
      
      setCourses(coursesData || [
        { id: '1', title: 'Advanced NWP', description: 'NWP course', domain: 'Meteorology', level: 'Advanced', trainerId: '1', batch_code: 'B-2026-NWP', deliveryMode: 'Hybrid', duration: '6 weeks', enrollment_count: 45, max_capacity: 50, start_date: '2026-09-10', end_date: '2026-10-20', status: 'active', created_at: '' } as any
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/profile', { bio, specializations: tags });
      setProfile(prev => prev ? { ...prev, bio, specializations: tags } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCourse = await api.post<Course>('/courses', courseForm);
      setCourses([...courses, newCourse || { ...courseForm, id: Date.now().toString(), status: 'active', enrollment_count: 0 } as any]);
      setShowCourseModal(false);
    } catch (error) {
      console.error('Error creating course', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Studio...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-200">
      <div className="bg-gradient-to-r from-navy via-[#0A192F] to-[#0D2A4A] border border-[rgba(148,163,184,0.1)] rounded-xl p-8 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-6">
          <div className="h-24 w-24 bg-cyan-900/50 rounded-full flex items-center justify-center border-2 border-cyan-400">
            <UserCircle size={48} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{profile?.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-cyan-400 bg-cyan-900/30 px-3 py-1 rounded-full">
                <Award size={14} /> Faculty Studio
              </span>
              <span className="flex items-center gap-1"><Building size={14} /> {profile?.institute_id}</span>
              <span className="flex items-center gap-1"><Briefcase size={14} /> {profile?.experienceYears} Yrs Exp</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Profile Details</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-cyan-400 hover:text-cyan-300 p-2">
                <Edit2 size={18} />
              </button>
            ) : (
              <button onClick={handleSaveProfile} className="text-green-400 hover:text-green-300 p-2">
                <Save size={18} />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Mail size={16} /> {profile?.email}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Bio</label>
              {isEditing ? (
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#111C30] border border-gray-700 rounded p-2 text-sm text-gray-200 h-24"
                />
              ) : (
                <p className="text-sm">{profile?.bio}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-[#111C30] border border-cyan-900/50 rounded text-xs text-cyan-100 flex items-center gap-1">
                    {tag}
                    {isEditing && <X size={12} className="cursor-pointer hover:text-red-400" onClick={() => handleRemoveTag(tag)} />}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <input 
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="New skill..."
                    className="flex-1 bg-[#111C30] border border-gray-700 rounded px-2 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button onClick={handleAddTag} className="bg-cyan-600 hover:bg-cyan-500 p-1 rounded">
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'text-sky-400', bg: 'bg-sky-400/10' },
              { label: 'Total Trainees', value: courses.reduce((acc, c: any) => acc + (c.enrollment_count || 0), 0), icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
              { label: 'Assessments', value: 12, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'Avg Score', value: '78%', icon: Award, color: 'text-green-400', bg: 'bg-green-400/10' }
            ].map((stat, i) => (
              <div key={i} className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">My Courses & Batches</h2>
              <button 
                onClick={() => setShowCourseModal(true)}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus size={16} /> Create Course
              </button>
            </div>

            <div className="space-y-4">
              {courses.map((course: any) => (
                <div key={course.id} className="bg-[#111C30] border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-900/50 transition-colors">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      {course.title}
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                        {course.batch_code}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen size={14} /> {course.domain}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {course.enrollment_count}/{course.max_capacity} Enrolled</span>
                      <span className="flex items-center gap-1"><Calendar size={14} /> {course.start_date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded border border-gray-700">Manage</button>
                    <button className="px-3 py-1.5 text-sm bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded">Gradebook</button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="text-center py-8 text-gray-500">No courses created yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCourseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0C1526] border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#0C1526] z-10">
              <h2 className="text-xl font-bold text-white">Create New Course / Batch</h2>
              <button onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Course Title</label>
                  <input required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Batch Code</label>
                  <input required value={courseForm.batch_code} onChange={e => setCourseForm({...courseForm, batch_code: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Domain</label>
                  <select value={courseForm.domain} onChange={e => setCourseForm({...courseForm, domain: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white">
                    <option>Meteorology</option><option>Oceanography</option><option>Seismology</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Max Capacity</label>
                  <input type="number" required value={courseForm.max_capacity} onChange={e => setCourseForm({...courseForm, max_capacity: parseInt(e.target.value)})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Start Date</label>
                  <input type="date" required value={courseForm.start_date} onChange={e => setCourseForm({...courseForm, start_date: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">End Date</label>
                  <input type="date" required value={courseForm.end_date} onChange={e => setCourseForm({...courseForm, end_date: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Description</label>
                <textarea required value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="w-full bg-[#111C30] border border-gray-700 rounded px-3 py-2 text-white h-24" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyStudio;
