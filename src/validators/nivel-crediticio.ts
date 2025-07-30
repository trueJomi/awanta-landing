import { z } from "astro/zod";

export const schemaNivelCrediticio = z.object({
    dni: z.string().length(8, "El DNI debe tener 8 dígitos").regex(/^\d+$/, "El DNI solo puede contener números"),
})