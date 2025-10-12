import { Router } from "express";
import { register, login, profile } from "../controllers/auth.controller";
import { auth } from "../middleware/auth";

const router = Router();

// --- Rutas Públicas (no requieren token) ---
router.post('/register', register);
router.post('/login', login);

// --- Rutas Protegidas (requieren token) ---
// Aplico el middleware 'auth' a esta ruta.
// Me asegurop de que use el método GET.
router.get('/me', auth, profile);

export default router;