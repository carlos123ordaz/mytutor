import { Router } from 'express';
import multer from 'multer';
import { uploadFile, getUploadUrl } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadRouter = Router();

uploadRouter.post('/', authenticate, upload.single('file'), uploadFile);
uploadRouter.get('/:id/url', authenticate, getUploadUrl);
