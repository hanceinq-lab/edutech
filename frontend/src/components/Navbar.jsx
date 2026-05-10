import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const dashboardLink =
    user?.role === 'admin'      ? '/admin'      :
    user?.role === 'instructor' ? '/instructor' :
    '/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-600">
            <GraduationCap className="w-7 h-7" />
            EduFlow
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Explore
            </Link>

            {user ? (
              <>
                <Link to={dashboardLink} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=64`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-600">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link to="/courses" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700">Explore</Link>
          {user ? (
            <>
              <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700">Dashboard</Link>
              <button onClick={handleLogout} className="block text-sm text-red-500 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-brand-600">Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
