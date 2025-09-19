import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

// La interfaz para nuestra petición se mantiene igual
interface AuthRequest extends Request {
  userId?: string;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");

    // --- VERIFICACIÓN MEJORADA ---
    // Verificamos si el payload es un objeto y si tiene la propiedad 'id'
    if (typeof decoded === 'object' && decoded.id) {
      req.userId = decoded.id;
      next();
    } else {
      // Si el payload es un string o un objeto sin 'id', el token es inválido
      throw new Error('Invalid token payload');
    }
    
  } catch (error) {
    // Este bloque 'catch' ahora atrapa tanto los errores de jwt.verify
    // como el error que lanzamos nosotros si el payload no es correcto.
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Token is invalid" });
  }
};