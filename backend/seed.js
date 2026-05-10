/**
 * EduFlow Seed Script
 * Run: node backend/seed.js
 * 
 * Creates:
 *   - 1 admin account
 *   - 3 instructor accounts
 *   - 1 student account
 *   - 12 realistic courses across various categories
 *   - Multiple lessons per course with real YouTube video URLs
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Enrollment from './models/Enrollment.js';
import Progress from './models/Progress.js';
// ─── Public demo video URLs (no embed restrictions) ───────────────────────

const DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

// Helper
let videoIndex = 0;

const getVideoUrl = () => {
  const url = DEMO_VIDEOS[videoIndex % DEMO_VIDEOS.length];
  videoIndex++;
  return url;
};

// ─── Realistic seed data ────────────────────────────────────────────────────

const INSTRUCTORS = [
  {
    name: 'Dr. Sarah Chen',
    email: 'sarah@eduflow.dev',
    password: 'password123',
    role: 'instructor',
    bio: 'Senior software engineer with 12 years of experience at Google and Meta. Passionate about teaching web technologies.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Marcus Williams',
    email: 'marcus@eduflow.dev',
    password: 'password123',
    role: 'instructor',
    bio: 'Data scientist and ML engineer. PhD in Computer Science from MIT. Author of two best-selling programming books.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@eduflow.dev',
    password: 'password123',
    role: 'instructor',
    bio: 'Full-stack developer and UX designer. Founder of two successful startups. 200K+ students taught worldwide.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

const COURSES = [
  // ── Sarah Chen's courses ──
  {
    title: 'The Complete React Developer Course (with Hooks & Redux)',
    description: 'Master React from scratch to advanced patterns. Learn hooks, context, Redux Toolkit, React Query, testing with Jest, and build 5 real-world projects including a full e-commerce app.',
    category: 'Web Development',
    level: 'intermediate',
    price: 49.99,
    isFree: false,
    rating: 4.8,
    ratingsCount: 12450,
    enrolledCount: 34200,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop',
    tags: ['React', 'Hooks', 'Redux', 'JavaScript', 'Frontend', 'Component Architecture'],
    lessons: [
      { title: 'Course Introduction & Setup', description: 'Overview of what you will build and setting up your dev environment', videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk', isPreview: true, order: 1 },
      { title: 'React Fundamentals: JSX & Components', description: 'Understanding JSX, functional components, and the component tree', videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM', isPreview: true, order: 2 },
      { title: 'useState & Event Handling', description: 'Managing local component state and handling user interactions', videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0', isPreview: false, order: 3 },
      { title: 'useEffect & Data Fetching', description: 'Side effects, lifecycle, and fetching data from APIs', videoUrl: 'https://www.youtube.com/embed/UVhIMwHDS7k', isPreview: false, order: 4 },
      { title: 'useContext & Global State', description: 'Sharing state across components without prop drilling', videoUrl: 'https://www.youtube.com/embed/3XaXKiXtNjw', isPreview: false, order: 5 },
      { title: 'useReducer for Complex State', description: 'Managing complex state logic with useReducer', videoUrl: 'https://www.youtube.com/embed/kK_Wqx3RnHk', isPreview: false, order: 6 },
      { title: 'Custom Hooks', description: 'Building reusable logic with custom React hooks', videoUrl: 'https://www.youtube.com/embed/6ThXsUwLWvc', isPreview: false, order: 7 },
      { title: 'React Router v6', description: 'Client-side navigation, nested routes, and protected routes', videoUrl: 'https://www.youtube.com/embed/Ul3y1LXxzdU', isPreview: false, order: 8 },
      { title: 'Redux Toolkit Fundamentals', description: 'Modern Redux with createSlice, RTK Query, and DevTools', videoUrl: 'https://www.youtube.com/embed/9zySeP5vH9c', isPreview: false, order: 9 },
      { title: 'Project: Building an E-commerce App', description: 'Putting it all together in a real-world project', videoUrl: 'https://www.youtube.com/embed/tLjjTQf_As4', isPreview: false, order: 10 },
    ],
  },
  {
    title: 'Node.js & Express: Build REST APIs from Scratch',
    description: 'Learn to build scalable, production-ready REST APIs with Node.js, Express, MongoDB, JWT authentication, and deploy to AWS. Includes rate limiting, file uploads, email sending, and Stripe payments.',
    category: 'Web Development',
    level: 'intermediate',
    price: 44.99,
    isFree: false,
    rating: 4.7,
    ratingsCount: 8230,
    enrolledCount: 21500,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop',
    tags: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JWT', 'Backend'],
    lessons: [
      { title: 'Node.js Fundamentals', description: 'Event loop, modules, npm, and core Node APIs', videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4', isPreview: true, order: 1 },
      { title: 'Building Your First Express Server', description: 'Routes, middleware, and request/response cycle', videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE', isPreview: true, order: 2 },
      { title: 'MongoDB & Mongoose', description: 'Schema design, CRUD operations, and relationships', videoUrl: 'https://www.youtube.com/embed/DZBGEVgL2eE', isPreview: false, order: 3 },
      { title: 'Authentication with JWT', description: 'Register, login, protect routes with JSON Web Tokens', videoUrl: 'https://www.youtube.com/embed/7Q17ubqLfaM', isPreview: false, order: 4 },
      { title: 'File Uploads with Multer', description: 'Handle image and file uploads, store on S3', videoUrl: 'https://www.youtube.com/embed/EVOFt8Its6I', isPreview: false, order: 5 },
      { title: 'Error Handling & Validation', description: 'Centralized error handling, input validation with Joi', videoUrl: 'https://www.youtube.com/embed/pBUA3qpuDGs', isPreview: false, order: 6 },
      { title: 'Deploying to AWS EC2', description: 'Production deployment, Nginx reverse proxy, PM2', videoUrl: 'https://www.youtube.com/embed/oHAQ3TzUTro', isPreview: false, order: 7 },
    ],
  },
  {
    title: 'Git & GitHub: The Complete Developer Workflow',
    description: 'Everything you need to use Git professionally. Branching strategies, pull requests, code reviews, rebasing, cherry-picking, CI/CD integration, and collaborating on open source projects.',
    category: 'Web Development',
    level: 'beginner',
    price: 0,
    isFree: true,
    rating: 4.9,
    ratingsCount: 5600,
    enrolledCount: 89000,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop',
    tags: ['Git', 'GitHub', 'Version Control', 'Collaboration', 'CI/CD'],
    lessons: [
      { title: 'What is Git? Installation & Config', description: 'Version control basics and setting up Git', videoUrl: 'https://www.youtube.com/embed/8JJ101D3knE', isPreview: true, order: 1 },
      { title: 'Core Git Commands', description: 'init, add, commit, status, log, diff', videoUrl: 'https://www.youtube.com/embed/HVsySz-h9r4', isPreview: true, order: 2 },
      { title: 'Branching & Merging', description: 'Working with branches, merge conflicts, and strategies', videoUrl: 'https://www.youtube.com/embed/e2IbNHi4uCI', isPreview: false, order: 3 },
      { title: 'GitHub: Remotes & Pull Requests', description: 'Pushing, pulling, forks, and the PR workflow', videoUrl: 'https://www.youtube.com/embed/rgbCcBNZcdQ', isPreview: false, order: 4 },
      { title: 'Rebasing & Advanced History', description: 'Rebase vs merge, interactive rebase, cherry-pick', videoUrl: 'https://www.youtube.com/embed/f1wnYdLEpgI', isPreview: false, order: 5 },
    ],
  },

  // ── Marcus Williams' courses ──
  {
    title: 'Python for Data Science & Machine Learning Bootcamp',
    description: 'Go from zero to hero in Python and data science. Master NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and build real ML models including classification, regression, clustering, and neural networks.',
    category: 'Data Science',
    level: 'beginner',
    price: 59.99,
    isFree: false,
    rating: 4.8,
    ratingsCount: 28700,
    enrolledCount: 75000,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop',
    tags: ['Python', 'Data Science', 'Machine Learning', 'NumPy', 'Pandas', 'Scikit-Learn'],
    lessons: [
      { title: 'Python Crash Course for Data Science', description: 'Python basics: variables, lists, dicts, loops, functions', videoUrl: 'https://www.youtube.com/embed/LHBE6Q9XlzI', isPreview: true, order: 1 },
      { title: 'NumPy Fundamentals', description: 'Arrays, indexing, broadcasting, vectorized operations', videoUrl: 'https://www.youtube.com/embed/QUT1VHiLmmI', isPreview: true, order: 2 },
      { title: 'Data Manipulation with Pandas', description: 'DataFrames, cleaning messy data, groupby, pivot tables', videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg', isPreview: false, order: 3 },
      { title: 'Data Visualization: Matplotlib & Seaborn', description: 'Creating insightful charts and statistical plots', videoUrl: 'https://www.youtube.com/embed/3Xc3CA655Y4', isPreview: false, order: 4 },
      { title: 'Machine Learning with Scikit-Learn', description: 'Supervised learning: regression and classification models', videoUrl: 'https://www.youtube.com/embed/pqNCD_5r0IU', isPreview: false, order: 5 },
      { title: 'Natural Language Processing (NLP)', description: 'Text processing, TF-IDF, sentiment analysis', videoUrl: 'https://www.youtube.com/embed/X2vAabgKiuM', isPreview: false, order: 6 },
      { title: 'Neural Networks with TensorFlow & Keras', description: 'Deep learning fundamentals and building your first NN', videoUrl: 'https://www.youtube.com/embed/tPYj3fFJGjk', isPreview: false, order: 7 },
      { title: 'Capstone: House Price Prediction', description: 'End-to-end ML project from data to deployment', videoUrl: 'https://www.youtube.com/embed/QGN_6gANBEE', isPreview: false, order: 8 },
    ],
  },
  {
    title: 'SQL & Database Design Masterclass',
    description: 'Master SQL from basics to advanced queries. Covers PostgreSQL, indexing, query optimization, normalization, stored procedures, window functions, and integrating databases with Python and Node.js applications.',
    category: 'Data Science',
    level: 'beginner',
    price: 34.99,
    isFree: false,
    rating: 4.7,
    ratingsCount: 11200,
    enrolledCount: 29500,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop',
    tags: ['SQL', 'PostgreSQL', 'Database Design', 'Query Optimization'],
    lessons: [
      { title: 'Introduction to Databases & SQL', description: 'Relational databases, tables, rows, and SQL overview', videoUrl: 'https://www.youtube.com/embed/HXV3zeQKqGY', isPreview: true, order: 1 },
      { title: 'SELECT Queries & Filtering', description: 'SELECT, WHERE, ORDER BY, LIMIT, OFFSET', videoUrl: 'https://www.youtube.com/embed/9URM1_2S0ho', isPreview: false, order: 2 },
      { title: 'JOINs: Connecting Tables', description: 'INNER, LEFT, RIGHT, FULL OUTER, CROSS joins with examples', videoUrl: 'https://www.youtube.com/embed/9yeOJ0ZMUYw', isPreview: false, order: 3 },
      { title: 'Aggregate Functions & GROUP BY', description: 'COUNT, SUM, AVG, MIN, MAX, HAVING clause', videoUrl: 'https://www.youtube.com/embed/Jh_pvk48jHA', isPreview: false, order: 4 },
      { title: 'Window Functions', description: 'ROW_NUMBER, RANK, LAG, LEAD, running totals', videoUrl: 'https://www.youtube.com/embed/Ww71knvhQ-s', isPreview: false, order: 5 },
      { title: 'Database Design & Normalization', description: '1NF, 2NF, 3NF, entity relationships, ER diagrams', videoUrl: 'https://www.youtube.com/embed/ztHopE5Wnpc', isPreview: false, order: 6 },
    ],
  },
  {
    title: 'AWS Cloud Practitioner: Zero to Certified',
    description: 'Prepare for the AWS Cloud Practitioner exam with hands-on labs. Covers EC2, S3, RDS, Lambda, CloudFront, IAM, VPC, and all core services. Includes practice exams and exam tips.',
    category: 'Cloud & DevOps',
    level: 'beginner',
    price: 39.99,
    isFree: false,
    rating: 4.9,
    ratingsCount: 15600,
    enrolledCount: 42000,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop',
    tags: ['AWS', 'Cloud Computing', 'Certification', 'DevOps', 'Infrastructure'],
    lessons: [
      { title: 'Cloud Computing Fundamentals', description: 'What is cloud computing? IaaS, PaaS, SaaS explained', videoUrl: 'https://www.youtube.com/embed/M988_fsOSWo', isPreview: true, order: 1 },
      { title: 'AWS Global Infrastructure', description: 'Regions, Availability Zones, Edge Locations', videoUrl: 'https://www.youtube.com/embed/Z_Hs7LMwvmk', isPreview: true, order: 2 },
      { title: 'EC2: Virtual Servers in the Cloud', description: 'Launching instances, security groups, key pairs', videoUrl: 'https://www.youtube.com/embed/iHX-qlDwqtk', isPreview: false, order: 3 },
      { title: 'S3: Object Storage', description: 'Buckets, objects, storage classes, lifecycle rules', videoUrl: 'https://www.youtube.com/embed/mxT233EdY5c', isPreview: false, order: 4 },
      { title: 'IAM: Identity & Access Management', description: 'Users, groups, roles, policies, and best practices', videoUrl: 'https://www.youtube.com/embed/iF9fs8Rw4Uo', isPreview: false, order: 5 },
      { title: 'Lambda & Serverless Architecture', description: 'Function-as-a-service, triggers, and use cases', videoUrl: 'https://www.youtube.com/embed/eOBq__h4OJ4', isPreview: false, order: 6 },
      { title: 'RDS & Database Services', description: 'Managed databases, Aurora, DynamoDB overview', videoUrl: 'https://www.youtube.com/embed/eMzCI7S1P9M', isPreview: false, order: 7 },
      { title: 'Exam Preparation & Practice Questions', description: 'Review all domains and tackle practice exams', videoUrl: 'https://www.youtube.com/embed/NhDYbskXRgc', isPreview: false, order: 8 },
    ],
  },

  // ── Priya Sharma's courses ──
  {
    title: 'UI/UX Design Bootcamp: Figma to Prototype',
    description: 'Learn professional UI/UX design from scratch. Master Figma, user research, wireframing, prototyping, design systems, accessibility, and hand off designs to developers. Build a portfolio-ready case study.',
    category: 'UI/UX Design',
    level: 'beginner',
    price: 44.99,
    isFree: false,
    rating: 4.8,
    ratingsCount: 9800,
    enrolledCount: 26000,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&auto=format&fit=crop',
    tags: ['Figma', 'UI Design', 'UX Design', 'Prototyping', 'Design Systems'],
    lessons: [
      { title: 'Introduction to UX Design', description: 'What UX designers do, the design process, and career paths', videoUrl: 'https://www.youtube.com/embed/t0aCoqXKFOU', isPreview: true, order: 1 },
      { title: 'Figma Masterclass', description: 'Everything you need to know about Figma to design professionally', videoUrl: 'https://www.youtube.com/embed/FTFaQWZBqQ8', isPreview: true, order: 2 },
      { title: 'User Research Methods', description: 'Surveys, interviews, usability testing, affinity mapping', videoUrl: 'https://www.youtube.com/embed/bAARmsv8I4M', isPreview: false, order: 3 },
      { title: 'Wireframing & Information Architecture', description: 'Low-fidelity wireframes, user flows, sitemaps', videoUrl: 'https://www.youtube.com/embed/qpH7-KFWZRI', isPreview: false, order: 4 },
      { title: 'Visual Design Fundamentals', description: 'Typography, color theory, spacing, and layout grids', videoUrl: 'https://www.youtube.com/embed/_Hp_dI0__qY', isPreview: false, order: 5 },
      { title: 'Design Systems & Components', description: 'Building and maintaining a scalable component library', videoUrl: 'https://www.youtube.com/embed/EK-pHkc5EL4', isPreview: false, order: 6 },
      { title: 'Prototyping & Interactions in Figma', description: 'Advanced prototyping, animations, and micro-interactions', videoUrl: 'https://www.youtube.com/embed/UoHAaQ-RQLU', isPreview: false, order: 7 },
      { title: 'Case Study: Redesigning a Mobile App', description: 'Full redesign project for your portfolio', videoUrl: 'https://www.youtube.com/embed/prFKLw8tpRQ', isPreview: false, order: 8 },
    ],
  },
  {
    title: 'TypeScript: The Complete Developer Guide',
    description: 'Learn TypeScript deeply and write better JavaScript. Covers types, interfaces, generics, decorators, advanced type manipulation, integration with React and Node.js, and migrating JS codebases.',
    category: 'Web Development',
    level: 'intermediate',
    price: 39.99,
    isFree: false,
    rating: 4.8,
    ratingsCount: 7400,
    enrolledCount: 19800,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&auto=format&fit=crop',
    tags: ['TypeScript', 'JavaScript', 'Type Safety', 'React', 'Node.js'],
    lessons: [
      { title: 'Why TypeScript? Setup & Basics', description: 'TypeScript advantages, tsconfig, and basic types', videoUrl: 'https://www.youtube.com/embed/BCg4U1FzODs', isPreview: true, order: 1 },
      { title: 'Interfaces & Type Aliases', description: 'Modeling data with interfaces and type composition', videoUrl: 'https://www.youtube.com/embed/7NU6K4U5bKk', isPreview: false, order: 2 },
      { title: 'Generics', description: 'Writing reusable, type-safe code with generics', videoUrl: 'https://www.youtube.com/embed/nViEqpgwxHE', isPreview: false, order: 3 },
      { title: 'Classes & OOP in TypeScript', description: 'Classes, access modifiers, abstract classes, mixins', videoUrl: 'https://www.youtube.com/embed/ZkhvuMBIHBU', isPreview: false, order: 4 },
      { title: 'Advanced Types', description: 'Union, intersection, mapped, conditional, utility types', videoUrl: 'https://www.youtube.com/embed/RxX4e3CeBBY', isPreview: false, order: 5 },
      { title: 'TypeScript with React', description: 'Typing props, hooks, events, and context in React apps', videoUrl: 'https://www.youtube.com/embed/NPinGSYx-oM', isPreview: false, order: 6 },
    ],
  },
  {
    title: 'Flutter & Dart: Build iOS & Android Apps',
    description: 'Build beautiful cross-platform mobile apps with Flutter. Learn Dart, widget composition, state management with Provider and Riverpod, local storage, REST API integration, Firebase, and deploy to app stores.',
    category: 'Mobile Development',
    level: 'beginner',
    price: 49.99,
    isFree: false,
    rating: 4.7,
    ratingsCount: 13500,
    enrolledCount: 35000,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop',
    tags: ['Flutter', 'Dart', 'Mobile Development', 'iOS', 'Android', 'Firebase'],
    lessons: [
      { title: 'Dart Language Fundamentals', description: 'Variables, functions, classes, async/await in Dart', videoUrl: 'https://www.youtube.com/embed/F3JuuYuOUK4', isPreview: true, order: 1 },
      { title: 'Flutter Introduction & Setup', description: 'Installing Flutter, your first app, hot reload', videoUrl: 'https://www.youtube.com/embed/1ukSR1GRtMU', isPreview: true, order: 2 },
      { title: 'Widgets Deep Dive', description: 'StatelessWidget, StatefulWidget, common material widgets', videoUrl: 'https://www.youtube.com/embed/TSIhiZ5jRB0', isPreview: false, order: 3 },
      { title: 'Layouts: Row, Column, Stack', description: 'Building complex UI layouts in Flutter', videoUrl: 'https://www.youtube.com/embed/RJEnTRBxaSg', isPreview: false, order: 4 },
      { title: 'State Management with Riverpod', description: 'Managing app state with the modern Riverpod package', videoUrl: 'https://www.youtube.com/embed/vtGCteFYs4M', isPreview: false, order: 5 },
      { title: 'Navigation & Routing', description: 'GoRouter, named routes, and deep links', videoUrl: 'https://www.youtube.com/embed/yvSqGqLW7Uo', isPreview: false, order: 6 },
      { title: 'REST APIs & Firebase Integration', description: 'Fetching data, authentication, and Firestore', videoUrl: 'https://www.youtube.com/embed/HFLjfel-AV0', isPreview: false, order: 7 },
      { title: 'Publishing to App Stores', description: 'Build & release to Google Play and Apple App Store', videoUrl: 'https://www.youtube.com/embed/g-0B_Vfc9qM', isPreview: false, order: 8 },
    ],
  },
  {
    title: 'Docker & Kubernetes: The Complete Container Guide',
    description: 'Master containerization and orchestration. Learn Docker from basics to multi-stage builds, Docker Compose for local development, Kubernetes deployments, services, ingress, Helm charts, and CI/CD pipelines.',
    category: 'Cloud & DevOps',
    level: 'advanced',
    price: 54.99,
    isFree: false,
    rating: 4.9,
    ratingsCount: 6200,
    enrolledCount: 15500,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop',
    tags: ['Docker', 'Kubernetes', 'DevOps', 'Containers', 'CI/CD', 'Helm'],
    lessons: [
      { title: 'What is Docker? Core Concepts', description: 'Containers vs VMs, images, layers, and the Docker daemon', videoUrl: 'https://www.youtube.com/embed/3c-iBn73dDE', isPreview: true, order: 1 },
      { title: 'Writing Dockerfiles', description: 'FROM, RUN, COPY, ENV, ENTRYPOINT best practices', videoUrl: 'https://www.youtube.com/embed/WmcdMiyqfZs', isPreview: true, order: 2 },
      { title: 'Docker Compose for Local Dev', description: 'Multi-container apps, volumes, networks', videoUrl: 'https://www.youtube.com/embed/HG6yIjqMVvE', isPreview: false, order: 3 },
      { title: 'Kubernetes Architecture', description: 'Nodes, pods, deployments, services, and namespaces', videoUrl: 'https://www.youtube.com/embed/X48VuDVv0do', isPreview: false, order: 4 },
      { title: 'Deploying to Kubernetes', description: 'kubectl, YAML manifests, rolling updates', videoUrl: 'https://www.youtube.com/embed/KVBON1lA9N8', isPreview: false, order: 5 },
      { title: 'Ingress & Load Balancing', description: 'Exposing services with Nginx Ingress and TLS', videoUrl: 'https://www.youtube.com/embed/80Ew_fsV4rM', isPreview: false, order: 6 },
      { title: 'Helm: Kubernetes Package Manager', description: 'Charts, values, templating, and Helm repositories', videoUrl: 'https://www.youtube.com/embed/-ykwb1d0DXU', isPreview: false, order: 7 },
      { title: 'CI/CD with GitHub Actions + K8s', description: 'Automated build, test, and deploy pipelines', videoUrl: 'https://www.youtube.com/embed/R8_veQiYBjI', isPreview: false, order: 8 },
    ],
  },
  {
    title: 'Cybersecurity Fundamentals: Ethical Hacking & Penetration Testing',
    description: 'Learn ethical hacking the right way. Covers network security, vulnerability scanning, web application attacks (OWASP Top 10), social engineering, cryptography, and preparing for CompTIA Security+ certification.',
    category: 'Cybersecurity',
    level: 'intermediate',
    price: 64.99,
    isFree: false,
    rating: 4.7,
    ratingsCount: 4800,
    enrolledCount: 11200,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop',
    tags: ['Cybersecurity', 'Ethical Hacking', 'Penetration Testing', 'OWASP', 'Security'],
    lessons: [
      { title: 'Introduction to Cybersecurity', description: 'The security landscape, threat actors, CIA triad', videoUrl: 'https://www.youtube.com/embed/hxA5Hbn-Q-I', isPreview: true, order: 1 },
      { title: 'Networking for Hackers', description: 'TCP/IP, DNS, HTTP, Wireshark packet analysis', videoUrl: 'https://www.youtube.com/embed/qiQR5rTSshw', isPreview: true, order: 2 },
      { title: 'Reconnaissance & OSINT', description: 'Passive and active information gathering techniques', videoUrl: 'https://www.youtube.com/embed/lQJhcl2jSJM', isPreview: false, order: 3 },
      { title: 'Vulnerability Scanning with Nmap & Nessus', description: 'Scanning networks and identifying vulnerabilities', videoUrl: 'https://www.youtube.com/embed/4t4kBkMsDbQ', isPreview: false, order: 4 },
      { title: 'Web Application Attacks (OWASP Top 10)', description: 'SQL injection, XSS, CSRF, broken auth, and more', videoUrl: 'https://www.youtube.com/embed/u3VTR0qT4EI', isPreview: false, order: 5 },
      { title: 'Metasploit Framework', description: 'Using Metasploit for controlled penetration testing', videoUrl: 'https://www.youtube.com/embed/8lR27r8Y_ik', isPreview: false, order: 6 },
    ],
  },
  {
    title: 'Digital Marketing Masterclass 2024: SEO, Ads & Social Media',
    description: 'The most comprehensive digital marketing course. Learn SEO (on-page & off-page), Google Ads, Facebook & Instagram Ads, content marketing, email funnels, analytics, and grow any business online.',
    category: 'Marketing',
    level: 'beginner',
    price: 0,
    isFree: true,
    rating: 4.6,
    ratingsCount: 22000,
    enrolledCount: 98000,
    isPublished: true,
    thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&auto=format&fit=crop',
    tags: ['Digital Marketing', 'SEO', 'Google Ads', 'Social Media', 'Email Marketing'],
    lessons: [
      { title: 'Digital Marketing Overview & Strategy', description: 'The marketing funnel, channels, and building a strategy', videoUrl: 'https://www.youtube.com/embed/bixR-KIJKYM', isPreview: true, order: 1 },
      { title: 'SEO Fundamentals', description: 'How search engines work, keywords, on-page SEO', videoUrl: 'https://www.youtube.com/embed/DvwS7cV9GmQ', isPreview: true, order: 2 },
      { title: 'Advanced SEO & Link Building', description: 'Technical SEO, backlinks, and outranking competitors', videoUrl: 'https://www.youtube.com/embed/hF515-0Tduk', isPreview: false, order: 3 },
      { title: 'Google Ads (PPC) Campaigns', description: 'Search, display, and shopping campaigns that convert', videoUrl: 'https://www.youtube.com/embed/GBg_LDf7F-I', isPreview: false, order: 4 },
      { title: 'Facebook & Instagram Advertising', description: 'Targeting, ad formats, retargeting, and ROAS', videoUrl: 'https://www.youtube.com/embed/J0n2Wut1k-E', isPreview: false, order: 5 },
      { title: 'Email Marketing & Automation', description: 'Building lists, segmentation, drip campaigns', videoUrl: 'https://www.youtube.com/embed/q7OuGFYB4L4', isPreview: false, order: 6 },
      { title: 'Google Analytics 4', description: 'Tracking, attribution, and data-driven decisions', videoUrl: 'https://www.youtube.com/embed/voSHCCRXRe4', isPreview: false, order: 7 },
    ],
  },
];

// ─── Main seed function ────────────────────────────────────────────────────

async function seed() {
  await connectDB();
  console.log('📦 Connected to MongoDB');

  // Clear previously seeded data so re-running is always safe
  console.log('🗑️  Clearing previously seeded data...');
  const seedEmails = [...INSTRUCTORS.map(i => i.email), 'admin@eduflow.dev', 'student@eduflow.dev'];
  const existingUsers = await User.find({ email: { $in: seedEmails } }).select('_id');
  const existingIds = existingUsers.map(u => u._id);
  if (existingIds.length > 0) {
    const seededCourses = await Course.find({ instructor: { $in: existingIds } }).select('_id');
    const seededCourseIds = seededCourses.map(c => c._id);
    await Lesson.deleteMany({ course: { $in: seededCourseIds } });
    await Enrollment.deleteMany({ course: { $in: seededCourseIds } });
    await Course.deleteMany({ _id: { $in: seededCourseIds } });
  }
  await User.deleteMany({ email: { $in: seedEmails } });

  // Create admin
  console.log('👑 Creating admin...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@eduflow.dev',
    password: await bcrypt.hash('admin123', 12),
    role: 'admin',
    bio: 'Platform administrator',
  });

  // Create student
  console.log('🎓 Creating student...');
  const student = await User.create({
    name: 'Alex Johnson',
    email: 'student@eduflow.dev',
    password: await bcrypt.hash('password123', 12),
    role: 'student',
    bio: 'Passionate learner exploring web development and data science.',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
  });

  // Create instructors
  console.log('👩‍🏫 Creating instructors...');
  const instructors = await Promise.all(
    INSTRUCTORS.map(async (inst) => {
      const { password, ...rest } = inst;
      return User.create({ ...rest, password: await bcrypt.hash(password, 12) });
    })
  );

  const [sarah, marcus, priya] = instructors;

  // Map instructor emails to objects
  const instructorMap = {
    'sarah@eduflow.dev': sarah,
    'marcus@eduflow.dev': marcus,
    'priya@eduflow.dev': priya,
  };

  // Assign instructors to courses (first 3 = Sarah, next 3 = Marcus, rest = Priya)
  const instructorAssignments = [sarah, sarah, sarah, marcus, marcus, marcus, priya, priya, priya, priya, priya, priya];

  console.log('📚 Creating courses and lessons...');
  const createdCourses = [];

  for (let i = 0; i < COURSES.length; i++) {
    const courseData = COURSES[i];
    const instructor = instructorAssignments[i];
    const { lessons, ...courseFields } = courseData;

    // Create course
    const course = await Course.create({
      ...courseFields,
      instructor: instructor._id,
    });

    // Create lessons
    const createdLessons = [];
    for (const lessonData of lessons) {
      const lesson = await Lesson.create({
  ...lessonData,
  videoUrl: getVideoUrl(),
  course: course._id,
  videoKey: '',
});
      createdLessons.push(lesson._id);
    }

    // Link lessons to course
    course.lessons = createdLessons;
    await course.save();

    // Link course to instructor
    await User.findByIdAndUpdate(instructor._id, { $push: { createdCourses: course._id } });

    createdCourses.push(course);
    console.log(`  ✅ ${course.title} (${createdLessons.length} lessons)`);
  }

  // Enroll the student in a couple of free courses + one paid (simulated)
  console.log('📝 Enrolling student in some courses...');
  const freeCourses = createdCourses.filter((c) => c.isFree);
  for (const course of freeCourses.slice(0, 2)) {
    await Enrollment.create({
      user: student._id,
      course: course._id,
      paymentStatus: 'free',
      amount: 0,
    });
    await Course.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });
    await User.findByIdAndUpdate(student._id, { $push: { enrolledCourses: course._id } });
  }

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('─'.repeat(50));
  console.log('📧 Test Accounts:');
  console.log('  Admin:      admin@eduflow.dev      / admin123');
  console.log('  Instructor: sarah@eduflow.dev      / password123');
  console.log('  Instructor: marcus@eduflow.dev     / password123');
  console.log('  Instructor: priya@eduflow.dev      / password123');
  console.log('  Student:    student@eduflow.dev    / password123');
  console.log('─'.repeat(50));
  console.log(`📚 Created ${createdCourses.length} courses`);
  console.log(`🎥 Created ${COURSES.reduce((a, c) => a + c.lessons.length, 0)} lessons`);
  console.log('─'.repeat(50));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
