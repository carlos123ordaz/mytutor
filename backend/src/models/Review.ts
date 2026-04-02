import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  teacher: Types.ObjectId;
  reservation: Types.ObjectId;
  rating: number;
  comment?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reservation: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  comment: { type: String, maxlength: 1000 },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ teacher: 1, isPublic: 1, createdAt: -1 });
reviewSchema.index({ student: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
