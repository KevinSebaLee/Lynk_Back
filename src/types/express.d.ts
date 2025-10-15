import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        email?: string;
        nombre?: string;
      };
    }
  }
}

export {};
