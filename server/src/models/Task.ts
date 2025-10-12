import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Esta interfaz define la forma de nuestros documentos de Tarea
export interface ITask extends Document {
    _id: Types.ObjectId;
    user: Schema.Types.ObjectId;
    title: string;
    description: string;
    status: 'Pending' | 'Completed';
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Este tipo define el modelo para que TypeScript entienda los métodos estáticos
export type TaskModel = Model<ITask>;

const taskSchema = new Schema<ITask, TaskModel>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: false, default: '' },
        status: {
            type: String,
            enum: ['Pending', 'Completed'],
            default: 'Pending'
        },
        deleted: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

// Índice para mejorar el rendimiento de las búsquedas
taskSchema.index({ user: 1, createdAt: -1 });

const Task = mongoose.model<ITask, TaskModel>('Task', taskSchema);
export default Task;