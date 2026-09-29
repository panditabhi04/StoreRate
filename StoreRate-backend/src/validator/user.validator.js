import { z } from "zod";

export const createUserSchema = z.object({
    name: z
        .string()
        .trim(),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must not exceed 16 characters")
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        ),

    address: z
        .string()
        .trim()
        .max(400, "Address must not exceed 400 characters"),

   
});


export const updateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(20, "Name must be at least 20 characters")
        .max(60, "Name must not exceed 60 characters")
        .optional(),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .optional(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must not exceed 16 characters")
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        )
        .optional(),

    address: z
        .string()
        .trim()
        .max(400, "Address must not exceed 400 characters")
        .optional(),

    role: z
        .enum(["ADMIN", "USER", "OWNER"])
        .optional()
});