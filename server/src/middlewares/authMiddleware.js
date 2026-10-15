import { UnauthorizedError } from '../utils/errors.js';
import env from '../config/env.js';

/**
 * Middleware to enforce security token authentication on all API routes.
 * Supports:
 * - Authorization: Bearer <token>
 * - x-api-key: <token>
 * - x-auth-token: <token>
 * - ?token=<token> (query parameter for direct browser downloads like CSV export)
 */
export const verifySecurityToken = (req, res, next) => {
  // Allow health check endpoint without token
  if (req.path === '/health' || req.originalUrl === '/api/health') {
    return next();
  }

  // Preflight OPTIONS requests bypass auth
  if (req.method === 'OPTIONS') {
    return next();
  }

  let token = null;
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-api-key']) {
    token = req.headers['x-api-key'];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(
      new UnauthorizedError(
        'Access denied: Missing security token. Please provide Authorization: Bearer <token> or x-api-key header.'
      )
    );
  }

  if (token !== env.API_SECURITY_TOKEN) {
    return next(new UnauthorizedError('Access denied: Invalid security token provided.'));
  }

  next();
};

export default verifySecurityToken;
