// Admin-only: every account on the platform, with the power to give a plan for free or make an admin.
import { Router } from 'express';
import { Job } from '../models/Job.js';
import { Schedule } from '../models/Schedule.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { requireAdmin, requireAuth } from '../services/auth.js';
import { hasPaidAccess, PLANS, planOf } from '../services/plans.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
router.use(requireAuth, requireAdmin);

async function view(user) {
  const [videos, published, schedules] = await Promise.all([
    Job.countDocuments({ userId: user._id }),
    Job.countDocuments({ userId: user._id, status: 'published' }),
    Schedule.countDocuments({ userId: user._id }),
  ]);
  const sub = user.subscription || {};
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: planOf(user)?.id || null,
    access: hasPaidAccess(user),
    granted: Boolean(sub.granted),
    paidPlan: !sub.granted && sub.plan ? `${sub.plan} · ${sub.status}` : null,
    trialUsed: user.trialUsed,
    videos,
    published,
    schedules,
    createdAt: user.createdAt,
  };
}

router.get('/users', wrap(async (_req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json(await Promise.all(users.map(view)));
}));

// { plan: 'basic'|'pro'|'max'|null } gives or removes a free plan; { role: 'admin'|'user' } changes the role.
router.patch('/users/:id', wrap(async (req, res) => {
  const user = await User.findById(req.params.id).catch(() => null);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if ('role' in req.body) {
    const role = req.body.role === 'admin' ? 'admin' : 'user';
    if (role === 'user' && user.role === 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1) {
      return res.status(400).json({ error: 'The platform needs at least one admin' });
    }
    user.role = role;
  }

  if ('plan' in req.body) {
    const sub = user.subscription || {};
    if (sub.plan && !sub.granted && hasPaidAccess(user)) {
      return res.status(409).json({ error: 'This user pays through Razorpay. They can change or cancel it themselves.' });
    }
    const plan = req.body.plan;
    if (plan && !PLANS[plan]) return res.status(400).json({ error: 'Unknown plan' });
    user.subscription = plan
      ? { plan, interval: 'monthly', status: 'active', granted: true, cancelAtPeriodEnd: false } // no period: usage counts per calendar month
      : { plan: null, interval: null, status: 'none', granted: false };
  }

  await user.save();
  res.json(await view(user));
}));

// Sign a user out everywhere (e.g. a shared password).
router.post('/users/:id/logout', wrap(async (req, res) => {
  await Session.deleteMany({ userId: req.params.id });
  res.json({ ok: true });
}));

export default router;
