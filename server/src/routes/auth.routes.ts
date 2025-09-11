import { Router } from "express";
import { register, login, profile } from "../controllers/auth.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/me", auth, profile);

export default router;