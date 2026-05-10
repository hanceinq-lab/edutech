import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Plus, Users, DollarSign, BookOpen, Video, AlertCircle, X,
  ChevronDown, ChevronUp, Trash2, Eye, EyeOff, Edit3, Check,
  PlayCircle, Save,
} from 'lucide-react';

const CATEGORIES = [
  'Web Development', 'Data Science', 'Mobile Development', 'UI/UX Design',
  'Cloud & DevOps', 'Cybersecurity', 'Machine Learning', 'Business',
  'Photography', 'Music', 'Marketing', 'Other',
];

function Field({ label, name, type = 'text', placeholder, value, onChange, required, min, step }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} name={name} placeholder={placeholder} value={value}
        onChange={onChange} required={required} min={min} step={step}
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
      />
    </div>
  );
}

export default function InstructorDashboard() {
  const [courses,      setCourses]      = useState([]);
  const [showCreate,   setShowCreate]   = useState(false);
  const [editCourse,   setEditCourse]   = useState(null);
  const [expandedId,   setExpandedId]   = useState(null);
  const [error,        setError]        = useState('');
  const [formError,    setFormError]    = useState('');
  const [saving,       setSaving]       = useState(false);
  const [lessonForms,  setLessonForms]  = useState({});
  const [addingLesson, setAddingLesson] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Web Development',
    level: 'beginner', price: '', tags: '', thumbnail: '',
  });

  const loadCourses = () => {
    api.get('/courses/mine')
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => setError('Failed to load your courses.'));
  };

  const loadCourseLessons = async (courseId) => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setCourses((prev) =>
        prev.map((c) => c._id === courseId ? { ...c, lessons: data.course.lessons || [] } : c)
      );
    } catch {
      setError('Failed to load lessons.');
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => setForm({
    title: '', description: '', category: 'Web Development',
    level: 'beginner', price: '', tags: '', thumbnail: '',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const { data } = await api.post('/courses', payload);
      setCourses((prev) => [data.course, ...prev]);
      setShowCreate(false);
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (courseId) => {
    if (!editCourse) return;
    setSaving(true);
    try {
      const payload = {
        ...editCourse,
        price: parseFloat(editCourse.price) || 0,
        tags: typeof editCourse.tags === 'string'
          ? editCourse.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : editCourse.tags,
      };
      await api.put('/courses/' + courseId, payload);
      setCourses((prev) => prev.map((c) => c._id === courseId ? { ...c, ...payload } : c));
      setEditCourse(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (courseId, current) => {
    try {
      await api.put('/courses/' + courseId, { isPublished: !current });
      setCourses((prev) => prev.map((c) => c._id === courseId ? { ...c, isPublished: !current } : c));
    } catch {
      setError('Failed to update course status.');
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course and all its lessons? This cannot be undone.')) return;
    try {
      await api.delete('/courses/' + courseId);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch {
      setError('Failed to delete course.');
    }
  };

  const initLessonForm = (courseId) => {
    setLessonForms((p) => ({ ...p, [courseId]: { title: '', description: '', videoUrl: '', isPreview: false } }));
    setAddingLesson(courseId);
  };

  const handleLessonChange = (courseId, field, value) => {
    setLessonForms((p) => ({ ...p, [courseId]: { ...(p[courseId] || {}), [field]: value } }));
  };

  const submitLesson = async (courseId) => {
    const lf = lessonForms[courseId];
    if (!lf?.title) return;
    setSaving(true);
    try {
      const course = courses.find((c) => c._id === courseId);
      const order  = (course?.lessons?.length || 0) + 1;
      await api.post('/courses/' + courseId + '/lessons', {
        title: lf.title, description: lf.description,
        videoUrl: lf.videoUrl, isPreview: lf.isPreview, order,
      });
      await loadCourseLessons(courseId);
      setAddingLesson(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lesson.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (courseId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete('/courses/' + courseId + '/lessons/' + lessonId);
      await loadCourseLessons(courseId);
    } catch {
      setError('Failed to delete lesson.');
    }
  };

  const toggleExpand = async (courseId) => {
    if (expandedId === courseId) {
      setExpandedId(null);
    } else {
      setExpandedId(courseId);
      await loadCourseLessons(courseId);
    }
  };

  const totalStudents = courses.reduce((a, c) => a + (c.enrolledCount || 0), 0);
  const estRevenue    = courses.reduce((a, c) => a + (c.isFree ? 0 : (c.price || 0) * (c.enrolledCount || 0)), 0);

  const stats = [
    { icon: BookOpen,   label: 'Total courses',  value: courses.length,                              color: 'text-blue-600 bg-blue-50' },
    { icon: Users,      label: 'Total students', value: totalStudents,                               color: 'text-green-600 bg-green-50' },
    { icon: DollarSign, label: 'Est. revenue',   value: '$' + estRevenue.toFixed(0),                 color: 'text-purple-600 bg-purple-50' },
    { icon: Video,      label: 'Published',      value: courses.filter((c) => c.isPublished).length, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-500 mt-1">Create and manage your courses</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormError(''); resetForm(); }}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors text-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New course
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>

        {courses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No courses yet — create your first one!
          </div>
        )}

        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Course header */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-500 to-purple-600">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editCourse?._id === course._id ? (
                  <input
                    value={editCourse.title}
                    onChange={(e) => setEditCourse((p) => ({ ...p, title: e.target.value }))}
                    className="text-sm font-semibold text-gray-900 border border-brand-300 rounded-lg px-2 py-1 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                ) : (
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{course.title}</h3>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span>{course.category}</span>
                  <span>·</span>
                  <span className="capitalize">{course.level}</span>
                  <span>·</span>
                  <span>{course.isFree ? 'Free' : '$' + course.price}</span>
                  <span>·</span>
                  <span>{course.enrolledCount || 0} students</span>
                </div>
              </div>
              <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {editCourse?._id === course._id ? (
                  <>
                    <button onClick={() => handleEditSave(course._id)} disabled={saving}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditCourse(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Cancel">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditCourse({ ...course, tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || '') })}
                      className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => togglePublish(course._id, course.isPublished)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title={course.isPublished ? 'Unpublish' : 'Publish'}>
                      {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteCourse(course._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => toggleExpand(course._id)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-1" title="Manage lessons">
                  {expandedId === course._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Edit inline fields */}
            {editCourse?._id === course._id && (
              <div className="border-t border-gray-100 px-5 py-4 bg-brand-50/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea rows={2} value={editCourse.description}
                    onChange={(e) => setEditCourse((p) => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
                      <input type="number" min="0" step="0.01" value={editCourse.price}
                        onChange={(e) => setEditCourse((p) => ({ ...p, price: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                      <select value={editCourse.level}
                        onChange={(e) => setEditCourse((p) => ({ ...p, level: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Thumbnail URL</label>
                    <input type="url" placeholder="https://..." value={editCourse.thumbnail || ''}
                      onChange={(e) => setEditCourse((p) => ({ ...p, thumbnail: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated)</label>
                    <input type="text" placeholder="React, Hooks, JavaScript"
                      value={typeof editCourse.tags === 'string' ? editCourse.tags : (editCourse.tags || []).join(', ')}
                      onChange={(e) => setEditCourse((p) => ({ ...p, tags: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Lessons panel */}
            {expandedId === course._id && (
              <div className="border-t border-gray-100 bg-gray-50">
                <div className="px-5 py-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Video className="w-4 h-4 text-brand-500" />
                    Lessons ({course.lessons?.length || 0})
                  </h4>
                  {addingLesson !== course._id && (
                    <button onClick={() => initLessonForm(course._id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add lesson
                    </button>
                  )}
                </div>

                {course.lessons?.length > 0 ? (
                  <div className="divide-y divide-gray-200 border-t border-gray-100">
                    {course.lessons.map((lesson, i) => (
                      <div key={lesson._id || lesson} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <PlayCircle className="w-4 h-4 text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {i + 1}. {lesson.title || 'Lesson ' + (i + 1)}
                          </p>
                          {lesson.description && (
                            <p className="text-xs text-gray-400 truncate">{lesson.description}</p>
                          )}
                        </div>
                        {lesson.isPreview && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">Preview</span>
                        )}
                        <button onClick={() => deleteLesson(course._id, lesson._id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0" title="Delete lesson">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">No lessons yet — add your first lesson below</p>
                )}

                {addingLesson === course._id && (
                  <div className="border-t border-gray-200 px-5 py-4 bg-white">
                    <p className="text-sm font-semibold text-gray-700 mb-3">New Lesson</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Lesson title *</label>
                        <input type="text" placeholder="e.g. Introduction to React Hooks"
                          value={lessonForms[course._id]?.title || ''}
                          onChange={(e) => handleLessonChange(course._id, 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Video URL (YouTube, Vimeo, or direct MP4)</label>
                        <input type="url" placeholder="https://youtube.com/watch?v=..."
                          value={lessonForms[course._id]?.videoUrl || ''}
                          onChange={(e) => handleLessonChange(course._id, 'videoUrl', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
                        <input type="text" placeholder="What does this lesson cover?"
                          value={lessonForms[course._id]?.description || ''}
                          onChange={(e) => handleLessonChange(course._id, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input id={'preview-' + course._id} type="checkbox"
                          checked={lessonForms[course._id]?.isPreview || false}
                          onChange={(e) => handleLessonChange(course._id, 'isPreview', e.target.checked)}
                          className="w-4 h-4 accent-brand-600" />
                        <label htmlFor={'preview-' + course._id} className="text-xs text-gray-600 font-medium">
                          Free preview (visible without enrollment)
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => setAddingLesson(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => submitLesson(course._id)}
                        disabled={saving || !lessonForms[course._id]?.title}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Saving…' : 'Save lesson'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Create new course</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{formError}</div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <Field label="Course title *" name="title" placeholder="e.g. Complete React Developer Course"
                value={form.title} onChange={handleChange} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select name="level" value={form.level} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <Field label="Price (0 = free)" name="price" type="number"
                  placeholder="29.99" value={form.price} onChange={handleChange} min={0} step="0.01" />
              </div>
              <Field label="Thumbnail URL" name="thumbnail" type="url"
                placeholder="https://images.unsplash.com/..." value={form.thumbnail} onChange={handleChange} />
              <Field label="Tags (comma-separated)" name="tags"
                placeholder="JavaScript, React, Hooks" value={form.tags} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} required
                  placeholder="What will students learn? What makes this course special?"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
                  {saving ? 'Creating…' : 'Create course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
