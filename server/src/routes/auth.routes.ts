import { Router } from "express";
import { register, login, profile } from "../controllers/auth.controller";
import { auth } from "../middleware/auth";

const router = Router();

// --- Rutas Públicas (no requieren token) ---
router.post('/register', register);
router.post('/login', login);

// --- Rutas Protegidas (requieren token) ---
// 1. Aplicamos el middleware 'auth' a esta ruta.
// 2. Nos aseguramos de que use el método GET.
router.get('/me', auth, profile);

export default router;