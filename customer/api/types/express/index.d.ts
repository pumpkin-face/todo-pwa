import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string; // o number, dependiendo del caso chiquis
    }
  }
}