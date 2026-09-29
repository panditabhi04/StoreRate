import { z } from "zod";

export const createAdminSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(1, "Name cannot be empty")
        .max(60, "Name must not exceed 60 characters"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Invalid email address")
        .max(255, "Email must not exceed 255 characters"),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        ),

    address: z
        .string({ required_error: "Address is required" })
        .trim()
        .min(1, "Address cannot be empty")
        .max(400, "Address must not exceed 400 characters"),

    role: z
        .enum(["ADMIN"])
        .optional()
        .default("ADMIN")
});
export const updateAdminSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .max(60, "Name must not exceed 60 characters")
        .optional(),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .max(255, "Email must not exceed 255 characters")
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
        .min(1, "Address cannot be empty")
        .max(400, "Address must not exceed 400 characters")
        .optional()
});
