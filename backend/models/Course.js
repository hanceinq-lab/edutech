import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, required: true },
    thumbnail:    { type: String, default: '' },
    instructor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category:     { type: String, required: true },
    level:        { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    price:        { type: Number, default: 0, min: 0 },
    isFree:       { type: Boolean, default: true },
    lessons:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    enrolledCount:{ type: Number, default: 0 },
    rating:       { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    isPublished:  { type: Boolean, default: false },
    tags:         [String],
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Course', courseSchema);
