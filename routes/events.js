import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Event from '../models/Event.js';

const router = express.Router();

// GET /api/events - Public endpoint to get all active events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .sort({ date: 1 }) // Sort by date ascending
      .select('-__v'); // Exclude version key

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/events/:id - Public endpoint to get a single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('-__v');

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/events - Protected endpoint to create event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, date, location, imageUrl, registrationLink } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and date are required',
      });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location: location || 'TBA',
      imageUrl: imageUrl || '',
      registrationLink: registrationLink || '',
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT /api/events/:id - Protected endpoint to update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, date, location, imageUrl, registrationLink } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (location !== undefined) updateData.location = location;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (registrationLink !== undefined) updateData.registrationLink = registrationLink;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Error updating event:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/events/:id - Protected endpoint to delete event (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
