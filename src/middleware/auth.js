import 'dotenv/config';
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  console.log(req.headers);  // Log all headers to inspect what is being received

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(authHeader)  // This will log the `Authorization` header or `null`/`undefined`
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
