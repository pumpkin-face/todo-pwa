import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define la forma del payload del token
interface JwtPayload {
    id: string;
}

export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization || '';
    
    // El token se extrae de forma más segura
    const token = header.startsWith('Bearer') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "changeme") as JwtPayload;
        
        req.userId = payload.id;
        
        next();
    } catch (e) {
        console.error("Error verifying token:", e);
        return res.status(401).json({ message: "Token is invalid" });
    }
}