import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    order:       { type: Number, required: true },
    videoKey:    { type: String, default: '' },   // S3 key (legacy)
    videoUrl:    { type: String, default: '' },   // Direct URL (YouTube, Vimeo, MP4)
    duration:    { type: Number, default: 0 },
    isPreview:   { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);
