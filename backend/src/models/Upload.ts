import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUpload extends Document {
  _id: Types.ObjectId;
  uploader: Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  bucket: string;
  storageKey: string;
  publicUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const uploadSchema = new Schema<IUpload>({
  uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  bucket: { type: String, required: true },
  storageKey: { type: String, required: true },
  publicUrl: { type: String },
}, { timestamps: true });

uploadSchema.index({ uploader: 1 });

export const Upload = mongoose.model<IUpload>('Upload', uploadSchema);
