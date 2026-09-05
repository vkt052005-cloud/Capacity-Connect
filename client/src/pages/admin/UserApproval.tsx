import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, ShieldAlert, Edit } from 'lucide-react';
import { api } from '../../utils/api';
import { User } from '../../types';

const UserApproval: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/admin/users');
      // Mock Data
      setUsers(data || [
        { id: '1', name: 'Ramesh Kumar', email: 'ramesh@imd.gov.in', role: 'trainee', institute_id: 'IMD', status: 'pending', created_at: '2026-08-30T10:00:00Z', is_active: false },
        { id: '2', name: 'Dr. Anita', email: 'anita@incois.gov.in', role: 'trainer', institute_id: 'INCOIS', status: 'approved', created_at: '2026-08-25T10:00:00Z', is_active: true },
        { id: '3', name: 'Suresh Menon', email: 'suresh@ncmrwf.gov.in', role: 'trainee', institute_id: 'NCMRWF', status: 'rejected', created_at: '2026-08-28T10:00:00Z', is_active: false }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, status: 'approved' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to ${status} this user?`)) return;
    try {
      await api.put(`/admin/users/${userId}/approve`, { status });
      setUsers(users.map(u => u.id === userId ? { ...u, status, is_active: status === 'approved' } : u));
    } catch (e) {
      console.error(e);
      alert('Error updating user status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesTab = activeTab === 'all' || u.status === activeTab;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    all: users.length
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading users...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-cyan-400" /> User Approvals
        </h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#111C30] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white"
          />
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-800">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} <span className="ml-2 bg-gray-800 text-xs px-2 py-0.5 rounded-full">{counts[tab]}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#0C1526] border border-[rgba(148,163,184,0.1)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111C30] border-b border-gray-800 text-sm text-gray-400">
                <th className="p-4 font-medium">User Details</th>
                <th className="p-4 font-medium">Role & Institute</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Registered Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-[#111C30]/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-200 capitalize">{user.role}</div>
                    <div className="text-xs text-cyan-400">{user.institute_id}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs border ${
                      user.status === 'approved' ? 'bg-green-900/30 text-green-400 border-green-800/50' :
                      user.status === 'rejected' ? 'bg-red-900/30 text-red-400 border-red-800/50' :
                      'bg-yellow-900/30 text-yellow-400 border-yellow-800/50'
                    }`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {user.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusChange(user.id, 'approved')} className="p-2 bg-green-900/20 text-green-400 hover:bg-green-900/40 rounded border border-green-800/50" title="Approve">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => handleStatusChange(user.id, 'rejected')} className="p-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded border border-red-800/50" title="Reject">
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    {user.status === 'approved' && (
                      <button className="p-2 bg-orange-900/20 text-orange-400 hover:bg-orange-900/40 rounded border border-orange-800/50" title="Suspend">
                        <ShieldAlert size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No users found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserApproval;
