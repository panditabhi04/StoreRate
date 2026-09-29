import { z } from "zod";

export const createStoreSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Store name is required")
        .max(100, "Store name must not exceed 100 characters"),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    address: z
        .string()
        .trim()
        .min(1, "Address is required")
        .max(400, "Address must not exceed 400 characters"),

    owner_id: z
        .number()
        .int()
        .positive("Owner ID must be a positive number")
});

export const updateStoreSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Store name cannot be empty")
        .max(100, "Store name must not exceed 100 characters")
        .optional(),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .optional(),

    address: z
        .string()
        .trim()
        .min(1, "Address cannot be empty")
        .max(400, "Address must not exceed 400 characters")
        .optional(),

    owner_id: z
        .number()
        .int()
        .positive("Owner ID must be a positive number")
        .optional()
});