import express from 'express';
import {
  getCourses, getMyCourses, getCourseById,
  createCourse, updateCourse, deleteCourse,
  getLessonUploadUrl, addLesson, updateLesson, deleteLesson, getLesson,
  updateProgress, getProgress,
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ── /mine must come BEFORE /:id ──
router.get('/mine', protect, authorize('instructor', 'admin'), getMyCourses);

// ── Public ──
router.get('/',    getCourses);
router.get('/:id', getCourseById);

// ── Instructor / Admin ──
router.post('/',    protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id',  protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// ── Lessons ──
router.post('/:courseId/lessons/presign',          protect, authorize('instructor', 'admin'), getLessonUploadUrl);
router.post('/:courseId/lessons',                  protect, authorize('instructor', 'admin'), addLesson);
router.put('/:courseId/lessons/:lessonId',         protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:courseId/lessons/:lessonId',      protect, authorize('instructor', 'admin'), deleteLesson);
router.get('/:courseId/lessons/:lessonId',         protect, getLesson);

// ── Progress ──
router.post('/:courseId/progress', protect, updateProgress);
router.get('/:courseId/progress',  protect, getProgress);

export default router;
