import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const safeRole = ['student', 'instructor'].includes(role) ? role : 'student';
    const exists   = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const user  = await User.create({ name, email, password, role: safeRole });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, bio }, { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) { next(err); }
};
