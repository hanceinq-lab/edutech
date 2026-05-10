import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user }                       = useAuth();
  const [enrollments, setEnrollments]  = useState([]);
  const [loading, setLoading]          = useState(true);
  const [error, setError]              = useState('');

  useEffect(() => {
    api.get('/payments/my-enrollments')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => setError('Failed to load your courses.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: BookOpen,   label: 'Enrolled courses', value: enrollments.length,                              color: 'bg-blue-50 text-blue-600' },
    { icon: TrendingUp, label: 'In progress',       value: enrollments.filter((e) => e.course).length,     color: 'bg-green-50 text-green-600' },
    { icon: Clock,      label: 'Hours learned',     value: '—',                                            color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No courses yet</p>
          <p className="text-gray-400 text-sm mb-4">Explore our catalog and enroll for free</p>
          <Link to="/" className="inline-block bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(({ course, _id }) => {
            if (!course) return null;
            const firstLesson = course.lessons?.[0];
            return (
              <Link
                key={_id}
                to={firstLesson ? `/courses/${course._id}/learn/${firstLesson}` : `/courses/${course._id}`}
                className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col gap-3 group"
              >
                <div className="aspect-video bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl overflow-hidden flex-shrink-0">
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{course.instructor?.name}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span><span>0%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
