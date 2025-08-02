import { z } from "astro/zod";

export const schemaTableData = z.object({
  ID: z.string(),
  Monto: z.string(),
  Apertura: z.string(),
  Vencimiento: z.string(),
  Tiempo: z.string(),
  Intereses: z.string(),
  Tasa: z.string(),
  FechaPago: z.string().optional(),
  Estado: z.union([z.literal("pendiente"), z.literal("pagado")]),
  Nombre: z.string(),
  DNI: z.string(),
  telefono: z.string(),
  fechaNacimiento: z.string(),
});
