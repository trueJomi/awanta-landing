import { FetchApi } from "@/lib/fetch";
import type { Score } from "@/models/NivelCredito";
import type { schemaNivelCrediticio } from "@/validators/nivel-crediticio";
import type { z } from "astro/zod";

const API= new FetchApi("/api");



export function getScoring(body: z.infer<typeof schemaNivelCrediticio>) {
    return API.POST<Score>("/credit.json", body);
}