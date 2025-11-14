import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['News Article', 'Press Release', 'Blog Post', 'Event Coverage', 'Success Story'],
      default: 'News Article',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    author: {
      type: String,
      default: 'Pankho Ki Udaan Team',
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    externalLink: {
      type: String,
      default: '',
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
mediaSchema.index({ slug: 1 });
mediaSchema.index({ isPublished: 1 });
mediaSchema.index({ publishedDate: -1 });
mediaSchema.index({ category: 1 });

// Generate slug from title before saving
mediaSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;

