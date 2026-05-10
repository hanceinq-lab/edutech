import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Just a health check — actual signaling is via Socket.IO
router.get('/status', protect, (_req, res) => res.json({ status: 'live server active' }));

export default router;
