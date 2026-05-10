import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';
import { getPresignedUploadUrl, getCloudFrontSignedUrl } from '../utils/s3.js';
import { v4 as uuid } from 'uuid';

// ─── Public ────────────────────────────────────────────────────────────────

// GET /api/courses
export const getCourses = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const { search, category, level, free } = req.query;

    const query = { isPublished: true };
    if (search)          query.$text    = { $search: search };
    if (category)        query.category = category;
    if (level)           query.level    = level;
    if (free === 'true') query.isFree   = true;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name avatar')
        .select('-lessons')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    res.json({ courses, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/courses/:id
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate({ path: 'lessons', select: 'title order duration isPreview _id description' });

    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ course });
  } catch (err) { next(err); }
};

// ─── Instructor ─────────────────────────────────────────────────────────────

// GET /api/courses/mine
export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .select('-lessons')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ courses });
  } catch (err) { next(err); }
};

// POST /api/courses
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, level, price, tags } = req.body;
    if (!title || !description || !category)
      return res.status(400).json({ error: 'Title, description and category are required' });

    const parsedPrice = parseFloat(price) || 0;
    const course = await Course.create({
      title, description, category,
      level:  level  || 'beginner',
      price:  parsedPrice,
      isFree: parsedPrice === 0,
      tags:   Array.isArray(tags) ? tags : [],
      instructor: req.user._id,
    });

    await req.user.updateOne({ $push: { createdCourses: course._id } });
    res.status(201).json({ course });
  } catch (err) { next(err); }
};

// PUT /api/courses/:id
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const isOwner = course.instructor.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    const update = { ...req.body };
    if (update.price !== undefined) {
      update.price  = parseFloat(update.price) || 0;
      update.isFree = update.price === 0;
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, update, {
      new: true, runValidators: true,
    });
    res.json({ course: updated });
  } catch (err) { next(err); }
};

// DELETE /api/courses/:id
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const isOwner = course.instructor.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    await Lesson.deleteMany({ course: course._id });
    await Progress.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ message: 'Course deleted' });
  } catch (err) { next(err); }
};

// ─── Lessons ────────────────────────────────────────────────────────────────

// POST /api/courses/:courseId/lessons/presign
export const getLessonUploadUrl = async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType)
      return res.status(400).json({ error: 'fileName and contentType are required' });

    const ext = fileName.split('.').pop();
    const key = `videos/${req.params.courseId}/${uuid()}.${ext}`;
    const { url, fields } = await getPresignedUploadUrl(key, contentType);
    res.json({ uploadUrl: url, fields, key });
  } catch (err) { next(err); }
};

// POST /api/courses/:courseId/lessons
export const addLesson = async (req, res, next) => {
  try {
    const { title, order, videoKey, duration, isPreview, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Lesson title is required' });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const isOwner = course.instructor.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    const { videoUrl } = req.body;
    const lessonCount = await Lesson.countDocuments({ course: course._id });
    const lesson = await Lesson.create({
      title,
      order:       order       ?? lessonCount + 1,
      videoKey:    videoKey    || '',
      videoUrl:    videoUrl    || '',
      duration:    duration    || 0,
      isPreview:   isPreview   || false,
      description: description || '',
      course:      course._id,
    });

    course.lessons.push(lesson._id);
    await course.save();
    res.status(201).json({ lesson });
  } catch (err) { next(err); }
};

// PUT /api/courses/:courseId/lessons/:lessonId
export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const course  = await Course.findById(req.params.courseId);
    const isOwner = course?.instructor.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    const updated = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, {
      new: true, runValidators: true,
    });
    res.json({ lesson: updated });
  } catch (err) { next(err); }
};

// DELETE /api/courses/:courseId/lessons/:lessonId
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const course  = await Course.findById(req.params.courseId);
    const isOwner = course?.instructor.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    await lesson.deleteOne();
    await Course.findByIdAndUpdate(req.params.courseId, {
      $pull: { lessons: lesson._id },
    });
    res.json({ message: 'Lesson deleted' });
  } catch (err) { next(err); }
};

// GET /api/courses/:courseId/lessons/:lessonId
export const getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    if (!lesson.isPreview) {
      const course  = await Course.findById(req.params.courseId);
      const isOwner = course?.instructor.toString() === req.user._id.toString();
      const enroll  = await Enrollment.findOne({
        user:          req.user._id,
        course:        req.params.courseId,
        paymentStatus: { $in: ['paid', 'free'] },
      });
      if (!isOwner && req.user.role !== 'admin' && !enroll)
        return res.status(403).json({ error: 'Enroll in this course to access lessons' });
    }

    // Prefer stored videoUrl (YouTube/Vimeo/direct), fall back to CloudFront signed URL
    const videoUrl = lesson.videoUrl || getCloudFrontSignedUrl(lesson.videoKey);
    res.json({ lesson: { ...lesson.toObject(), videoUrl } });
  } catch (err) { next(err); }
};

// ─── Progress ───────────────────────────────────────────────────────────────

// POST /api/courses/:courseId/progress
export const updateProgress = async (req, res, next) => {
  try {
    const { lessonId, watchedSeconds } = req.body;
    const course = await Course.findById(req.params.courseId).select('lessons');

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, course: req.params.courseId },
      {
        $addToSet: { completedLessons: lessonId },
        lastWatched: lessonId,
        $max: { watchedSeconds: watchedSeconds || 0 },
      },
      { upsert: true, new: true }
    );

    progress.percentComplete = Math.round(
      (progress.completedLessons.length / (course?.lessons?.length || 1)) * 100
    );
    await progress.save();
    res.json({ progress });
  } catch (err) { next(err); }
};

// GET /api/courses/:courseId/progress
export const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id, course: req.params.courseId,
    });
    res.json({ progress: progress || { completedLessons: [], percentComplete: 0 } });
  } catch (err) { next(err); }
};
