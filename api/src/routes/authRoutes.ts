import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/token', refreshToken);
router.delete('/logout', logout);

export default router;