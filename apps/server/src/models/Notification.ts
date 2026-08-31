import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'community_submission' | 'content_approved' | 'content_rejected' | 'new_official_content';
  title: string;
  message: string;
  relatedItemType?: 'question' | 'problem';
  relatedItemId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['community_submission', 'content_approved', 'content_rejected', 'new_official_content'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedItemType: { type: String, enum: ['question', 'problem'] },
  relatedItemId: { type: Schema.Types.ObjectId, refPath: 'itemModel' },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

notificationSchema.virtual('itemModel').get(function () {
  if (!this.relatedItemType) return undefined;
  return this.relatedItemType === 'problem' ? 'Problem' : 'Question';
});

export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
