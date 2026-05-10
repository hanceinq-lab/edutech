import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, BookOpen, DollarSign, Activity, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ users: 0, courses: 0, enrollments: 0 });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/courses?limit=20'),
    ])
      .then(([{ data: cd }]) => {
        const c = cd.courses || [];
        setCourses(c);
        setStats({
          courses:     cd.total || c.length,
          enrollments: c.reduce((a, x) => a + (x.enrolledCount || 0), 0),
          users:       '—',
        });
      })
      .catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (courseId, current) => {
    try {
      await api.put(`/courses/${courseId}`, { isPublished: !current });
      setCourses((prev) =>
        prev.map((c) => c._id === courseId ? { ...c, isPublished: !current } : c)
      );
    } catch { setError('Failed to update course.'); }
  };

  const statCards = [
    { icon: Users,      label: 'Total users',       value: stats.users,       color: 'text-blue-600 bg-blue-50' },
    { icon: BookOpen,   label: 'Total courses',      value: stats.courses,     color: 'text-green-600 bg-green-50' },
    { icon: Activity,   label: 'Total enrollments',  value: stats.enrollments, color: 'text-purple-600 bg-purple-50' },
    { icon: DollarSign, label: 'Revenue',            value: '$—',              color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Platform overview and management</p>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '…' : value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* All courses table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">All Courses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Title', 'Instructor', 'Students', 'Price', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.instructor?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.enrolledCount || 0}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.isFree ? 'Free' : `$${c.price}`}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(c._id, c.isPublished)}
                      className="text-brand-600 hover:underline text-xs font-semibold"
                    >
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && courses.length === 0 && (
          <div className="text-center py-12 text-gray-400">No courses found.</div>
        )}
      </div>
    </div>
  );
}
