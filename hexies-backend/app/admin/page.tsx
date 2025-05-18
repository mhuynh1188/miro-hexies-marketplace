// Create admin interface in your Next.js app
// app/admin/page.tsx - Simple admin dashboard

'use client';

import { useState, useEffect } from 'react';

interface Hexie {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  details?: string;
  free: boolean;
  is_user_created: boolean;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  miro_user_id: string;
  created_at: string;
  subscriptions?: any[];
}

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalHexies: number;
  userHexies: number;
  freeHexies: number;
  premiumHexies: number;
}

export default function AdminDashboard() {
  const [hexies, setHexies] = useState<Hexie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingHexie, setEditingHexie] = useState<Hexie | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // You'll need to create these admin API routes
      const [hexiesRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/hexies').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/stats').then(r => r.json())
      ]);
      
      setHexies(hexiesRes);
      setUsers(usersRes);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHexie = async (hexieId: string) => {
    if (!confirm('Are you sure you want to delete this hexie?')) return;
    
    try {
      await fetch(`/api/admin/hexies/${hexieId}`, { method: 'DELETE' });
      setHexies(prev => prev.filter(h => h.id !== hexieId));
    } catch (error) {
      console.error('Failed to delete hexie:', error);
      alert('Failed to delete hexie');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Hexies Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin Panel</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value={stats.totalUsers} color="blue" />
            <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} color="green" />
            <StatCard title="Total Hexies" value={stats.totalHexies} color="purple" />
            <StatCard title="User Created" value={stats.userHexies} color="orange" />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'hexies', label: 'Hexies' },
              { id: 'users', label: 'Users' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'hexies' && (
          <HexiesTable 
            hexies={hexies}
            onEdit={setEditingHexie}
            onDelete={handleDeleteHexie}
            onCreate={() => setShowCreateModal(true)}
          />
        )}

        {activeTab === 'users' && (
          <UsersTable users={users} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardOverview stats={stats} />
        )}
      </div>

      {/* Modals */}
      {(editingHexie || showCreateModal) && (
        <HexieModal
          hexie={editingHexie}
          onClose={() => {
            setEditingHexie(null);
            setShowCreateModal(false);
          }}
          onSave={() => {
            loadDashboardData();
            setEditingHexie(null);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <div className="text-white text-xl">📊</div>
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function HexiesTable({ hexies, onEdit, onDelete, onCreate }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Manage Hexies</h2>
        <button
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Hexie
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hexie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hexies.map((hexie) => (
              <tr key={hexie.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{hexie.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{hexie.title}</div>
                      <div className="text-sm text-gray-500">{hexie.summary.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {hexie.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    hexie.free 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hexie.free ? 'Free' : 'Premium'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(hexie.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(hexie)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(hexie.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTable({ users }) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-6">Users</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miro ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.subscriptions?.[0]?.plan_id === 'free'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user.subscriptions?.[0]?.plan_id || 'free'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.miro_user_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardOverview({ stats }) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Free Hexies</dt>
              <dd className="text-sm font-medium text-gray-900">{stats?.freeHexies || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Premium Hexies</dt>
              <dd className="text-sm font-medium text-gray-900">{stats?.premiumHexies || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">User Created</dt>
              <dd className="text-sm font-medium text-gray-900">{stats?.userHexies || 0}</dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-sm text-gray-600">Activity tracking will be implemented here</p>
        </div>
      </div>
    </div>
  );
}

function HexieModal({ hexie, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: hexie?.title || '',
    category: hexie?.category || 'methods',
    icon: hexie?.icon || '🔷',
    summary: hexie?.summary || '',
    details: hexie?.details || '',
    free: hexie?.free || false,
    difficulty: hexie?.difficulty || 'beginner',
    duration: hexie?.duration || '',
    team_size: hexie?.team_size || '',
    tags: hexie?.tags?.join(', ') || '',
    benefits: hexie?.benefits?.join(', ') || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        benefits: formData.benefits ? formData.benefits.split(',').map(benefit => benefit.trim()) : []
      };
      
      const url = hexie 
        ? `/api/admin/hexies/${hexie.id}`
        : '/api/admin/hexies';
      
      const method = hexie ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      onSave();
    } catch (error) {
      console.error('Failed to save hexie:', error);
      alert('Failed to save hexie');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {hexie ? 'Edit Hexie' : 'Create New Hexie'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="methods">Methods</option>
              <option value="teams">Teams</option>
              <option value="product">Product</option>
              <option value="leadership">Leadership</option>
              <option value="anti-patterns">Anti-patterns</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows={4}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="free"
              checked={formData.free}
              onChange={(e) => setFormData(prev => ({ ...prev, free: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="free" className="text-sm font-medium text-gray-700">
              Free Hexie
            </label>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}