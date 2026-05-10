# 🎓 EduFlow — Full-Stack Learning Management System

A production-grade online learning platform built with **React**, **Node.js/Express**, and **MongoDB**. Features course browsing, enrollment, video lessons, live sessions, instructor dashboards, and admin controls.

## ✨ What's Included

### Frontend (React + Vite + Tailwind CSS)
- **Landing page** — Hero, stats, featured courses, instructor CTA
- **Course catalog** (`/courses`) — Search, filter by category/level/price, pagination
- **Course detail page** — Syllabus, instructor bio, enroll/buy button
- **Course player** — Video player with progress tracking, lesson sidebar
- **Student dashboard** — Enrolled courses, progress overview
- **Instructor dashboard** — Create/edit/delete courses, manage lessons with YouTube/Vimeo/direct video URLs, publish/unpublish
- **Admin dashboard** — Platform overview, manage all courses
- **Auth pages** — Login & Register with role selection (student / instructor)

### Backend (Node.js + Express + MongoDB)
- JWT authentication with role-based access control
- Full CRUD for courses and lessons
- Progress tracking per student per lesson
- Free enrollment & Stripe checkout for paid courses
- Socket.IO live sessions (rooms)
- AWS S3 pre-signed upload URLs (optional)
- Rate limiting, Helmet security headers, CORS

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd trial

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and set MONGO_URI and JWT_SECRET (minimum required)

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if your backend runs on a different port
```

### 3. Seed the database (recommended)

```bash
cd backend
node seed.js
```

This creates realistic sample data:
| Account | Email | Password |
|---|---|---|
| Admin | admin@eduflow.dev | admin123 |
| Instructor (Dr. Sarah Chen) | sarah@eduflow.dev | password123 |
| Instructor (Marcus Williams) | marcus@eduflow.dev | password123 |
| Instructor (Priya Sharma) | priya@eduflow.dev | password123 |
| Student | student@eduflow.dev | password123 |

**12 courses** across Web Dev, Data Science, Cloud, UI/UX, Mobile, Cybersecurity, and Marketing — each with **5–10 video lessons** using real YouTube URLs.

### 4. Run development servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## 📁 Project Structure

```
trial/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, login, profile
│   │   ├── courseController.js # Course & lesson CRUD + progress
│   │   ├── liveController.js   # Socket.IO live rooms
│   │   └── paymentController.js # Stripe & free enrollment
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect
│   │   ├── roleMiddleware.js   # Role-based access
│   │   └── errorMiddleware.js  # Global error handler
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Course.js           # Course schema
│   │   ├── Lesson.js           # Lesson schema (videoUrl + videoKey)
│   │   ├── Enrollment.js       # Enrollment records
│   │   └── Progress.js         # Lesson completion tracking
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── liveRoutes.js
│   ├── utils/
│   │   ├── generateToken.js    # JWT signing
│   │   └── s3.js               # AWS S3 helpers
│   ├── seed.js                 # Database seed script
│   ├── server.js               # Express app entry point
│   └── .env.example
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js         # API client with JWT interceptor
        ├── components/
        │   ├── CourseCard.jsx   # Course card with thumbnail, rating
        │   ├── Navbar.jsx       # Responsive nav with auth state
        │   ├── VideoPlayer.jsx  # Custom player with progress tracking
        │   ├── LiveRoom.jsx     # Socket.IO live session room
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        └── pages/
            ├── Landing.jsx          # Home page
            ├── CoursesPage.jsx      # Browse & search all courses
            ├── CoursePage.jsx       # Individual course detail
            ├── CoursePlayer.jsx     # In-course video player
            ├── StudentDashboard.jsx # My courses & progress
            ├── InstructorDashboard.jsx # Create/manage courses & lessons
            ├── AdminDashboard.jsx   # Platform overview
            ├── Login.jsx
            ├── Register.jsx
            └── PaymentSuccess.jsx
```

---

## 🎥 Adding Lessons (Instructor Guide)

As an instructor, you can add lessons with:
- **YouTube URLs** — `https://www.youtube.com/watch?v=...`
- **Vimeo URLs** — `https://vimeo.com/...`
- **Direct MP4 URLs** — Any publicly accessible `.mp4` URL
- **AWS S3** — Upload via the presigned URL endpoint (requires AWS config)

1. Log in as an instructor → go to **Dashboard**
2. Create a course, fill in details, set price (0 for free)
3. Click the course row to expand the **Lessons** panel
4. Click **Add lesson**, enter the title and paste the video URL
5. Check **Free preview** if you want it visible before enrollment
6. Click **Publish** when ready to go live

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| PUT | `/api/auth/profile` | Authenticated |

### Courses
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/courses` | Public (supports `?search=&category=&level=&free=&page=&limit=`) |
| GET | `/api/courses/:id` | Public |
| GET | `/api/courses/mine` | Instructor/Admin |
| POST | `/api/courses` | Instructor/Admin |
| PUT | `/api/courses/:id` | Instructor/Admin |
| DELETE | `/api/courses/:id` | Instructor/Admin |
| POST | `/api/courses/:courseId/lessons` | Instructor/Admin |
| GET | `/api/courses/:courseId/lessons/:lessonId` | Authenticated (enrolled) |
| PUT | `/api/courses/:courseId/lessons/:lessonId` | Instructor/Admin |
| DELETE | `/api/courses/:courseId/lessons/:lessonId` | Instructor/Admin |
| POST | `/api/courses/:courseId/progress` | Authenticated |
| GET | `/api/courses/:courseId/progress` | Authenticated |

### Payments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/payments/enroll-free` | Authenticated |
| POST | `/api/payments/checkout` | Authenticated (Stripe) |
| GET | `/api/payments/my-enrollments` | Authenticated |

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons |
| Video | react-player (YouTube, Vimeo, MP4 support) |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Real-time | Socket.IO |
| Payments | Stripe (optional) |
| Storage | AWS S3 + CloudFront (optional) |
| Security | Helmet, express-rate-limit, CORS |
