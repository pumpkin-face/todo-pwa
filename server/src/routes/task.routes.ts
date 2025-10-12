import { Router } from 'express';
import { auth } from '../middleware/auth';
import { 
    list, 
    create, 
    getOne, 
    update, 
    destroy, 
    syncTasks
} from '../controllers/task.controller';

const router = Router();

// Rutas para la colección (/api/tasks)
router.route('/')
    .all(auth)
    .get(list)
    .post(create);

// Ruta para la sincronización (/api/tasks/sync)
router.post('/sync', auth, syncTasks);

// Rutas para un item individual (/api/tasks/:id)
router.route('/:id')
    .all(auth)
    .get(getOne)
    .put(update)
    .delete(destroy);

export default router;