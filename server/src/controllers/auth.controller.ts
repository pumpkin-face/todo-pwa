import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- Controlador para Registrar un Nuevo Usuario ---
export async function register(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;

        // 1. Validación de campos de entrada
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already in use" });
        }

        // 3. Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Crear y guardar el nuevo usuario
        const newUser = new User({
            name,
            email,
            password: passwordHash
        });
        const savedUser = await newUser.save();

        // 5. Crear el token JWT
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET || "changeme", {
            expiresIn: "7d"
        });

        // 6. Enviar la respuesta
        return res.status(201).json({
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
        });

    } catch (error) {
        console.error(error); // Registrar el error para depuración
        return res.status(500).json({ message: "Server error during registration" });
    }
}


// --- Controlador para Iniciar Sesión ---
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        // 1. Buscar al usuario por su email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Comparar la contraseña proporcionada con la guardada en la BD
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Crear el token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "changeme", {
            expiresIn: "7d"
        });

        // 4. Enviar la respuesta
        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error during login" });
    }
}

// --- Controlador para Obtener el Perfil del Usuario ---
export async function profile(req: Request, res: Response) {
    try {
        // 1. Busca al usuario usando el ID que viene del middleware de autenticación
        const user = await User.findById(req.userId).select("_id name email");

        // 2. Maneja el caso en que el usuario no se encuentre en la BD
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Si se encuentra, envía los datos del perfil
        return res.json({
            id: user._id,
            name: user.name,
            email: user.email,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error fetching profile" });
    }
}