// customer/src/types/index.ts

export type Task = {
    _id: string;
    title: string;
    description: string;
    status: 'Pending' | 'Completed';
    isDeleted?: boolean;
};

// También podemos añadir otros tipos que usamos
export type FilterStatus = 'all' | 'Completed' | 'Pending';