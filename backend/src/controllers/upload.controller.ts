import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import * as uploadService from '../services/upload.service';
import type { AuthRequest } from '../types';

export const uploadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  const upload = await uploadService.uploadPaymentProof(req.user._id, req.file);

  return sendSuccess(res, {
    _id: upload._id,
    filename: upload.filename,
    originalName: upload.originalName,
    mimetype: upload.mimetype,
    size: upload.size,
    publicUrl: upload.publicUrl,
    storageKey: upload.storageKey,
  }, 'File uploaded', 201);
});

export const getUploadUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const signedUrl = await uploadService.getUploadSignedUrl(
    req.params.id,
    req.user._id,
    req.user.role
  );

  return sendSuccess(res, { url: signedUrl });
});
