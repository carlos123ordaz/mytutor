import { Router } from 'express';
import passport from '../config/passport';
import { googleIdTokenLogin, googleCallback, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const authRouter = Router();

// Admin frontend: verify Google ID token and return JWT cookie
authRouter.post('/google', googleIdTokenLogin);

// Redirect user to Google consent screen (web frontend OAuth flow)
authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google redirects back here after consent
authRouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

authRouter.post('/logout', authenticate, logout);
authRouter.get('/me', authenticate, getMe);
