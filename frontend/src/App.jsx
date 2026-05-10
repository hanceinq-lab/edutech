import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const Landing           = lazy(() => import('./pages/Landing'));
const CoursesPage       = lazy(() => import('./pages/CoursesPage'));
const Login             = lazy(() => import('./pages/Login'));
const Register          = lazy(() => import('./pages/Register'));
const CoursePage        = lazy(() => import('./pages/CoursePage'));
const CoursePlayer      = lazy(() => import('./pages/CoursePlayer'));
const StudentDashboard  = lazy(() => import('./pages/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const LiveRoom          = lazy(() => import('./components/LiveRoom'));
const PaymentSuccess    = lazy(() => import('./pages/PaymentSuccess'));

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Public */}
                <Route path="/"            element={<Landing />} />
                <Route path="/courses"     element={<CoursesPage />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/register"    element={<Register />} />
                <Route path="/courses/:id" element={<CoursePage />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />

                {/* Any logged-in user */}
                <Route element={<ProtectedRoute roles={['student', 'instructor', 'admin']} />}>
                  <Route path="/dashboard"                              element={<StudentDashboard />} />
                  <Route path="/courses/:courseId/learn/:lessonId"      element={<CoursePlayer />} />
                  <Route path="/live/:roomId"                           element={<LiveRoom />} />
                </Route>

                {/* Instructor + Admin */}
                <Route element={<ProtectedRoute roles={['instructor', 'admin']} />}>
                  <Route path="/instructor" element={<InstructorDashboard />} />
                </Route>

                {/* Admin only */}
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
