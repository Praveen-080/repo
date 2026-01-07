import { auth } from '../firebaseAdmin.js';

export async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  const isAdmin = req.user?.admin === true || req.user?.claims?.admin === true;
  if (!isAdmin) return res.status(403).json({ error: 'Admin privileges required' });
  next();
}
