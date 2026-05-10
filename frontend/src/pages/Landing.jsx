import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { BookOpen, Video, Award, Users } from 'lucide-react';

const STATS = [
  { icon: BookOpen, label: 'Courses',       value: '500+' },
  { icon: Users,    label: 'Students',      value: '50K+' },
  { icon: Video,    label: 'Live Sessions', value: '200+' },
  { icon: Award,    label: 'Instructors',   value: '120+' },
];

export default function Landing() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses?limit=6')
      .then(({ data }) => setCourses(data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-brand-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-28 text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🚀 Learn from the best instructors
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto tracking-tight">
            Master New Skills with{' '}
            <span className="text-yellow-300">EduFlow</span>
          </h1>
          <p className="text-xl text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Thousands of courses, live sessions, and expert instructors — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-brand-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors text-lg shadow-xl"
            >
              Start learning free
            </Link>
            <Link
              to="/courses"
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors text-lg"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl mb-3">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured courses ── */}
      <section id="courses" className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
          <Link to="/courses" className="text-sm font-semibold text-brand-600 hover:underline">
            View all courses →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No courses published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => <CourseCard key={c._id} course={c} />)}
          </div>
        )}
      </section>

      {/* ── Instructor CTA ── */}
      <section className="bg-brand-600 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to start teaching?</h2>
          <p className="text-xl text-white/80 mb-8">Join 120+ instructors earning on EduFlow</p>
          <Link
            to="/register?role=instructor"
            className="inline-block bg-white text-brand-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors text-lg shadow-lg"
          >
            Become an instructor
          </Link>
        </div>
      </section>
    </div>
  );
}
