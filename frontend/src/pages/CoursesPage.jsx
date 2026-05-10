import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { Search, SlidersHorizontal, BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'All', 'Web Development', 'Data Science', 'Mobile Development',
  'UI/UX Design', 'Cloud & DevOps', 'Cybersecurity', 'Machine Learning',
  'Business', 'Photography', 'Music', 'Marketing',
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchQ    = searchParams.get('search')   || '';
  const category   = searchParams.get('category') || '';
  const level      = searchParams.get('level')    || '';
  const free       = searchParams.get('free')     || '';
  const page       = parseInt(searchParams.get('page') || '1');

  const [inputVal, setInputVal] = useState(searchQ);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', '12');
    if (searchQ)  params.set('search', searchQ);
    if (category) params.set('category', category);
    if (level)    params.set('level', level.toLowerCase());
    if (free)     params.set('free', free);

    api.get(`/courses?${params}`)
      .then(({ data }) => {
        setCourses(data.courses || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchQ, category, level, free, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', inputVal.trim());
  };

  const clearFilters = () => {
    setInputVal('');
    setSearchParams({});
  };

  const hasFilters = searchQ || category || level || free;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
        <p className="text-gray-500 mt-1">{total.toLocaleString()} courses available</p>
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search courses…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Search
          </button>
        </form>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
            filtersOpen ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-yellow-400" />}
        </button>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 flex flex-wrap gap-6">
          {/* Category */}
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const val = c === 'All' ? '' : c;
                const active = category === val;
                return (
                  <button
                    key={c}
                    onClick={() => setParam('category', val)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level */}
          <div className="min-w-[180px]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Level</p>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((l) => {
                const val = l === 'All' ? '' : l;
                const active = level === val;
                return (
                  <button
                    key={l}
                    onClick={() => setParam('level', val)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Free only */}
          <div className="min-w-[140px]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price</p>
            <button
              onClick={() => setParam('free', free ? '' : 'true')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                free ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
              }`}
            >
              Free only
            </button>
          </div>

          {/* Clear */}
          {hasFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && !filtersOpen && (
        <div className="flex flex-wrap gap-2 mb-5">
          {searchQ && <Chip label={`"${searchQ}"`} onRemove={() => { setInputVal(''); setParam('search', ''); }} />}
          {category && <Chip label={category} onRemove={() => setParam('category', '')} />}
          {level    && <Chip label={level}    onRemove={() => setParam('level', '')} />}
          {free     && <Chip label="Free"     onRemove={() => setParam('free', '')} />}
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium">Clear all</button>
        </div>
      )}

      {/* Course grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <BookOpen className="w-14 h-14 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-brand-600 hover:underline text-sm font-semibold">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <PaginBtn
            disabled={page <= 1}
            onClick={() => setParam('page', String(page - 1))}
            icon={<ChevronLeft className="w-4 h-4" />}
          />
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setParam('page', String(i + 1))}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                page === i + 1 ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <PaginBtn
            disabled={page >= pages}
            onClick={() => setParam('page', String(page + 1))}
            icon={<ChevronRight className="w-4 h-4" />}
          />
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900"><X className="w-3 h-3" /></button>
    </span>
  );
}

function PaginBtn({ onClick, disabled, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white"
    >
      {icon}
    </button>
  );
}
