import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

// Lazily initialize Stripe only if the key is present
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your .env file.');
  }
  const Stripe = require('stripe') || (async () => (await import('stripe')).default)();
  // Use dynamic import pattern compatible with ESM
  return null; // placeholder — see createCheckoutSession below
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(501).json({ error: 'Payments not configured on this server. Contact the administrator.' });
    }
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.isFree) return res.status(400).json({ error: 'Course is free — use enroll-free' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing?.paymentStatus === 'paid')
      return res.status(400).json({ error: 'Already enrolled' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(course.price * 100),
          product_data: { name: course.title },
        },
        quantity: 1,
      }],
      metadata: { courseId: course._id.toString(), userId: req.user._id.toString() },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.FRONTEND_URL}/courses/${courseId}`,
    });

    await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { stripeSessionId: session.id, paymentStatus: 'pending', amount: course.price },
      { upsert: true }
    );
    res.json({ url: session.url });
  } catch (err) { next(err); }
};

export const stripeWebhook = async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(501).json({ error: 'Stripe webhooks not configured.' });
  }
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const { courseId, userId } = event.data.object.metadata;
    await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      { paymentStatus: 'paid' },
      { upsert: true }
    );
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } });
  }
  res.json({ received: true });
};

export const enrollFree = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!course.isFree) return res.status(400).json({ error: 'This is a paid course' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing?.paymentStatus === 'free')
      return res.status(400).json({ error: 'Already enrolled' });

    const enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { paymentStatus: 'free' },
      { upsert: true, new: true }
    );
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    await req.user.updateOne({ $addToSet: { enrolledCourses: courseId } });
    res.json({ enrollment });
  } catch (err) { next(err); }
};

export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user._id,
      paymentStatus: { $in: ['paid', 'free'] },
    }).populate({ path: 'course', populate: { path: 'instructor', select: 'name avatar' } });
    res.json({ enrollments });
  } catch (err) { next(err); }
};
