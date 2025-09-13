import { Router } from "express";
import { list, create, update, destroy, bulksync } from "../controllers/task.controller";
import { auth } from "../middleware/auth";

const router = Router();
router.use(auth);
router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', destroy);
router.post('/bulksync', bulksync);

export default router;