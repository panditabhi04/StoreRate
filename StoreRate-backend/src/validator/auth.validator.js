import { z } from "zod";

export const registerUserSchema = z.object({
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
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        ),

    address: z
        .string()
        .trim()
        .max(400, "Address must not exceed 400 characters"),

    role: z
        .enum(["ADMIN", "USER", "OWNER"])
        .optional()
        .default("USER")
});