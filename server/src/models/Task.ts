import mongoose, { Document, Schema, Model } from "mongoose"; // 1. Importa 'Model'

// Tu interfaz ITask se queda igual
export interface ITask extends Document {
    user: Schema.Types.ObjectId;
    title: string;
    description: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    clientID?: string;
    deleted: boolean;
}

// 2. (OPCIONAL PERO RECOMENDADO) Crea un tipo para el modelo
// Esto ayuda a TypeScript a entender las funciones estáticas como .find(), .create()
export type TaskModel = Model<ITask>;

// Tu schema se queda igual
const taskSchema = new Schema<ITask, TaskModel>( // 3. Pasa los tipos aquí
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: false, default: '' },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
        },
        clientID: { type: String },
        deleted: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

taskSchema.index({ user: 1, createdAt: -1 });

// 4. Exporta el modelo con una sintaxis ligeramente diferente
const Task = mongoose.model<ITask, TaskModel>('Task', taskSchema);
export default Task;