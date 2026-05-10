import { Link } from 'react-router-dom';
import { Star, Users } from 'lucide-react';

export default function CourseCard({ course }) {
  const { _id, title, thumbnail, instructor, price, isFree, level, rating, enrolledCount, category } = course;

  return (
    <Link
      to={`/courses/${_id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-brand-500 to-purple-600 overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">📚</div>
        )}
        <span
          className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold shadow ${
            isFree ? 'bg-green-500 text-white' : 'bg-brand-600 text-white'
          }`}
        >
          {isFree ? 'Free' : `$${price}`}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-brand-600 font-semibold uppercase tracking-wide">{category}</span>

        <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500 truncate">{instructor?.name || 'Instructor'}</p>

        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-700">{Number(rating || 4.5).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{(enrolledCount || 0).toLocaleString()}</span>
          </div>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full capitalize">{level}</span>
        </div>
      </div>
    </Link>
  );
}
