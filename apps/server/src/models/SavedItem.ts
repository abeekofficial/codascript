import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedItem extends Document {
  user: mongoose.Types.ObjectId;
  itemType: 'question' | 'problem';
  itemId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const savedItemSchema = new Schema<ISavedItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['question', 'problem'], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'itemModel' }
  },
  {
    timestamps: true,
  }
);

// Virtual for dynamic population
savedItemSchema.virtual('itemModel').get(function () {
  return this.itemType === 'problem' ? 'Problem' : 'Question';
});

// Composite unique index
savedItemSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

export const SavedItemModel = mongoose.models.SavedItem || mongoose.model<ISavedItem>('SavedItem', savedItemSchema);
