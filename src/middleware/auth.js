export function requireAuth(req, res, next) {
  const id_user = req.cookies && req.cookies.id_user;
  if (!id_user) return res.status(401).json({ error: 'Unauthorized' });
  req.id_user = id_user;
  next();
}