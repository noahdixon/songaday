import { Request } from 'express';
import { User } from 'user';

declare global {
  namespace Express {
    export interface Request {
      userId?: number;
    }
  }
}