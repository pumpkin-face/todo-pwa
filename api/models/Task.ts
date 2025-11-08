import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ user: 1, createdAt: -1 });

// Evita recrear el modelo
export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);