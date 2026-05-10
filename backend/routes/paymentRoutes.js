import express from 'express';
import { createCheckoutSession, stripeWebhook, enrollFree, getMyEnrollments } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/webhook',        stripeWebhook);          // raw body — handled in server.js
router.post('/checkout',       protect, createCheckoutSession);
router.post('/enroll-free',    protect, enrollFree);
router.get('/my-enrollments',  protect, getMyEnrollments);

export default router;
