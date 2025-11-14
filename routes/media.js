import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Media from '../models/Media.js';

const router = express.Router();

// GET /api/media - Public endpoint to get all published articles
router.get('/', async (req, res) => {
  try {
    const { category, limit, page } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const query = { isPublished: true };
    if (category) {
      query.category = category;
    }

    const articles = await Media.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-content -__v'); // Exclude full content and version key

    const total = await Media.countDocuments(query);

    res.json({
      success: true,
      articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/media/:slug - Public endpoint to get a single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Media.findOne({ 
      slug: req.params.slug,
      isPublished: true 
    }).select('-__v');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/media - Protected endpoint to create article
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, category, description, content, imageUrl, author, publishedDate, externalLink } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and content are required',
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingArticle = await Media.findOne({ slug });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: 'An article with this title already exists',
      });
    }

    const newArticle = new Media({
      title,
      slug,
      category: category || 'News Article',
      description,
      content,
      imageUrl: imageUrl || '',
      author: author || 'Pankho Ki Udaan Team',
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      externalLink: externalLink || '',
    });

    const savedArticle = await newArticle.save();

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article: savedArticle,
    });
  } catch (error) {
    console.error('Error creating article:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT /api/media/:id - Protected endpoint to update article
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, category, description, content, imageUrl, author, publishedDate, externalLink, isPublished } = req.body;

    const updateData = {};
    if (title) {
      updateData.title = title;
      // Regenerate slug if title changed
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (content) updateData.content = content;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (author) updateData.author = author;
    if (publishedDate) updateData.publishedDate = new Date(publishedDate);
    if (externalLink !== undefined) updateData.externalLink = externalLink;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Check if new slug conflicts with existing article
    if (updateData.slug) {
      const existingArticle = await Media.findOne({ 
        slug: updateData.slug,
        _id: { $ne: req.params.id }
      });
      if (existingArticle) {
        return res.status(400).json({
          success: false,
          message: 'An article with this title already exists',
        });
      }
    }

    const article = await Media.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.json({
      success: true,
      message: 'Article updated successfully',
      article,
    });
  } catch (error) {
    console.error('Error updating article:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/media/:id - Protected endpoint to delete article (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const article = await Media.findByIdAndUpdate(
      req.params.id,
      { isPublished: false },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/media/admin/all - Protected endpoint to get all articles (including unpublished)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const articles = await Media.find()
      .sort({ publishedDate: -1 })
      .select('-__v');

    res.json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error('Error fetching all articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

