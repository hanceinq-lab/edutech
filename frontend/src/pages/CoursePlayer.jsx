import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import VideoPlayer from '../components/VideoPlayer';
import { CheckCircle, Circle, ChevronLeft, Menu, X, Loader2, Lock } from 'lucide-react';

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const navigate               = useNavigate();

  const [course,       setCourse]      = useState(null);
  const [lesson,       setLesson]      = useState(null);
  const [progress,     setProgress]    = useState({ completedLessons: [] });
  const [loading,      setLoading]     = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error,        setError]       = useState('');
  const [sidebarOpen,  setSidebarOpen] = useState(true);

  // Load course outline + progress
  useEffect(() => {
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/courses/${courseId}/progress`),
    ])
      .then(([{ data: cd }, { data: pd }]) => {
        setCourse(cd.course);
        setProgress(pd.progress || { completedLessons: [] });
      })
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  // Load active lesson
  useEffect(() => {
    if (!lessonId || lessonId === 'undefined') return;
    setLessonLoading(true);
    api.get(`/courses/${courseId}/lessons/${lessonId}`)
      .then(({ data }) => setLesson(data.lesson))
      .catch(() => setError('Could not load lesson. Make sure you are enrolled.'))
      .finally(() => setLessonLoading(false));
  }, [courseId, lessonId]);

  const handleComplete = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      completedLessons: [...new Set([...(prev.completedLessons || []), lessonId])],
    }));
  }, [lessonId]);

  const goToLesson = (id) => {
    navigate(`/courses/${courseId}/learn/${id}`);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const isCompleted = (id) =>
    (progress.completedLessons || []).includes(id) ||
    (progress.completedLessons || []).some((l) => l?._id === id || l === id);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <Lock className="w-12 h-12 text-gray-400" />
      <p className="text-gray-600 text-center">{error}</p>
      <Link to={`/courses/${courseId}`} className="text-brand-600 hover:underline text-sm">← Back to course</Link>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-950">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 bg-gray-900 text-white flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Course</p>
            <h2 className="text-sm font-semibold text-white truncate">{course?.title}</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white flex-shrink-0 md:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Progress</span>
            <span>{progress.percentComplete || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${progress.percentComplete || 0}%` }}
            />
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto py-2">
          {course?.lessons?.map((l, i) => {
            const lid    = l._id || l;
            const active = lid === lessonId;
            const done   = isCompleted(lid);
            return (
              <button
                key={lid}
                onClick={() => goToLesson(lid)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                  active ? 'bg-brand-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {done
                    ? <CheckCircle className="w-4 h-4 text-green-400" />
                    : <Circle className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-600'}`} />}
                </span>
                <span className="text-sm leading-snug">{i + 1}. {l.title || `Lesson ${i + 1}`}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Top bar */}
        <div className="flex-shrink-0 h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen((o) => !o)} className="text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <Link to={`/courses/${courseId}`} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to course</span>
          </Link>
          {lesson && (
            <span className="ml-2 text-white text-sm font-medium truncate">{lesson.title}</span>
          )}
        </div>

        {/* Video */}
        <div className="flex-1 flex flex-col bg-gray-950 p-4 gap-4 overflow-auto">
          {lessonLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            </div>
          ) : lesson?.videoUrl ? (
            <>
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                lessonId={lessonId}
                courseId={courseId}
                onComplete={handleComplete}
              />
              <div className="max-w-3xl">
                <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
                {lesson.description && (
                  <p className="text-gray-400 mt-2 text-sm leading-relaxed">{lesson.description}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-center px-4">
              <div>
                <Lock className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p className="font-medium">Select a lesson from the sidebar to start watching</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
