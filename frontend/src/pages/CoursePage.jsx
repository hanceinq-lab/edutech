import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Star, Users, BookOpen, Clock, Play, Lock,
  ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle,
} from 'lucide-react';

export default function CoursePage() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [course,    setCourse]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [enrolled,  setEnrolled]  = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error,     setError]     = useState('');
  const [expanded,  setExpanded]  = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/courses/${id}`)
      .then(async ({ data }) => {
        setCourse(data.course);
        if (user) {
          try {
            const { data: en } = await api.get('/payments/my-enrollments');
            setEnrolled((en.enrollments || []).some(
              (e) => (e.course?._id || e.course) === data.course._id
            ));
          } catch { /* silent */ }
        }
      })
      .catch(() => setError('Course not found.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }
    setEnrolling(true);
    setError('');
    try {
      if (course.isFree) {
        await api.post('/payments/enroll-free', { courseId: id });
        setEnrolled(true);
      } else {
        const { data } = await api.post('/payments/checkout', { courseId: id });
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const goLearn = () => {
    const first = course?.lessons?.[0];
    if (first) navigate(`/courses/${id}/learn/${first._id || first}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );

  if (error && !course) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-gray-600">{error}</p>
      <Link to="/courses" className="text-brand-600 hover:underline text-sm">← Back to courses</Link>
    </div>
  );

  if (!course) return null;

  const visibleLessons = expanded ? course.lessons : course.lessons?.slice(0, 6);

  return (
    <div className="bg-white">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</Link>
              <span className="text-gray-600">/</span>
              <span className="text-brand-400">{course.category}</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-white">{Number(course.rating || 4.5).toFixed(1)}</span>
                <span>({course.ratingsCount || 0} ratings)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{(course.enrolledCount || 0).toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{course.lessons?.length || 0} lessons</span>
              </div>
              <span className="bg-white/10 px-2 py-0.5 rounded capitalize">{course.level}</span>
            </div>

            {course.instructor && (
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={course.instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=4f46e5&color=fff`}
                  alt={course.instructor.name}
                  className="w-10 h-10 rounded-full ring-2 ring-white/20"
                />
                <div>
                  <p className="text-xs text-gray-400">Created by</p>
                  <p className="text-sm font-semibold text-white">{course.instructor.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Enroll card — visible on large screens inside hero */}
          <div className="hidden lg:block">
            <EnrollCard
              course={course}
              enrolled={enrolled}
              enrolling={enrolling}
              error={error}
              onEnroll={handleEnroll}
              onLearn={goLearn}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">

          {/* What you'll learn */}
          {course.tags?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-200 rounded-2xl p-5">
                {course.tags.map((tag) => (
                  <div key={tag} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {tag}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course content */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
              <span className="text-sm text-gray-500">{course.lessons?.length || 0} lessons</span>
            </div>

            {!course.lessons?.length ? (
              <p className="text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                No lessons added yet.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                {visibleLessons?.map((lesson, i) => {
                  const lid = lesson._id || lesson;
                  return (
                    <div key={lid}
                      className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          lesson.isPreview ? 'bg-brand-50' : 'bg-gray-100'
                        }`}>
                          {lesson.isPreview
                            ? <Play className="w-4 h-4 text-brand-600" />
                            : <Lock className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {i + 1}. {lesson.title || `Lesson ${i + 1}`}
                          </p>
                          {lesson.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        {lesson.duration > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                          </span>
                        )}
                        {lesson.isPreview && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Preview
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {course.lessons?.length > 6 && (
              <button onClick={() => setExpanded((e) => !e)}
                className="mt-3 flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
                {expanded
                  ? <><ChevronUp className="w-4 h-4" /> Show less</>
                  : <><ChevronDown className="w-4 h-4" /> Show all {course.lessons.length} lessons</>}
              </button>
            )}
          </section>

          {/* Instructor bio */}
          {course.instructor?.bio && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Instructor</h2>
              <div className="flex items-start gap-4">
                <img
                  src={course.instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=4f46e5&color=fff&size=80`}
                  alt={course.instructor.name}
                  className="w-16 h-16 rounded-full flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-gray-900">{course.instructor.name}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{course.instructor.bio}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sticky enroll card — mobile + right column */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="lg:hidden mb-6">
              <EnrollCard
                course={course}
                enrolled={enrolled}
                enrolling={enrolling}
                error={error}
                onEnroll={handleEnroll}
                onLearn={goLearn}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrollCard({ course, enrolled, enrolling, error, onEnroll, onLearn }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-5xl">📚</div>
      )}

      <div className="p-5 space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-extrabold ${course.isFree ? 'text-green-600' : 'text-gray-900'}`}>
            {course.isFree ? 'Free' : `$${course.price}`}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">{error}</div>
        )}

        {enrolled ? (
          <button onClick={onLearn}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Continue Learning
          </button>
        ) : (
          <button onClick={onEnroll} disabled={enrolling}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {enrolling ? 'Processing…' : course.isFree ? 'Enroll for Free' : `Buy · $${course.price}`}
          </button>
        )}

        <ul className="space-y-2.5 text-sm text-gray-600 pt-1 border-t border-gray-100">
          <li className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-brand-500 flex-shrink-0" />
            {course.lessons?.length || 0} lessons
          </li>
          <li className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
            Full lifetime access
          </li>
          <li className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-brand-500 flex-shrink-0" />
            {(course.enrolledCount || 0).toLocaleString()} enrolled
          </li>
        </ul>
      </div>
    </div>
  );
}
