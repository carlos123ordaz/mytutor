import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Upload, IUpload } from '../models/Upload';
import { uploadFileToBucket, getSignedUrl } from '../config/storage';
import { env } from '../config/env';
import { Types } from 'mongoose';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_SIZE_BYTES = env.maxFileSizeMb * 1024 * 1024;

export function validateUpload(mimetype: string, size: number): void {
  if (!ALLOWED_MIMETYPES.includes(mimetype)) {
    throw new Error('Invalid file type. Allowed: PDF, JPG, PNG');
  }
  if (size > MAX_SIZE_BYTES) {
    throw new Error(`File too large. Max size: ${env.maxFileSizeMb}MB`);
  }
}

export async function uploadPaymentProof(
  uploaderId: Types.ObjectId,
  file: Express.Multer.File
): Promise<IUpload> {
  validateUpload(file.mimetype, file.size);

  const ext = path.extname(file.originalname).toLowerCase();
  const uniqueFilename = `${uuidv4()}${ext}`;
  const storageKey = `payment-proofs/${uploaderId.toString()}/${uniqueFilename}`;

  let publicUrl: string | undefined;

  // Try to upload to GCS if configured
  if (env.gcsBucketName) {
    try {
      publicUrl = await uploadFileToBucket(file.buffer, storageKey, file.mimetype);
    } catch (error) {
      console.warn('GCS upload failed, storing metadata only:', error);
    }
  }

  const upload = await Upload.create({
    uploader: uploaderId,
    filename: uniqueFilename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    bucket: env.gcsBucketName || 'local',
    storageKey,
    publicUrl,
  });

  return upload;
}

export async function getUploadSignedUrl(
  uploadId: string,
  requesterId: Types.ObjectId,
  role: string
): Promise<string> {
  const upload = await Upload.findById(uploadId);
  if (!upload) throw new Error('Upload not found');

  // Only uploader, teacher (via reservation), or admin can access
  if (role !== 'admin' && upload.uploader.toString() !== requesterId.toString()) {
    throw new Error('Access denied');
  }

  if (!env.gcsBucketName) {
    return upload.publicUrl || '#';
  }

  return getSignedUrl(upload.storageKey, 60);
}
