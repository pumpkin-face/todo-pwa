import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

// Evita que se cree el modelo múltiples veces (importante para serverless)
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);