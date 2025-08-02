export const prerender = false;

import { getDataSheet } from "@/service/scoring";
import type { WrapperModel } from "@/types/wrapper.type";
import { schemaNivelCrediticio } from "@/validators/nivel-crediticio";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    // try {
    //     // console.log("query", params);
    // } catch (error) {
    //     const response: WrapperModel<null> = {
    //         status: false,            
    //         message: error instanceof Error ? error.message : "Error desconocido",
    //         data: null
    //     }
    //     return new Response(JSON.stringify(response), { status: 500 })
    // }
        const body = await request.json();
        const query = schemaNivelCrediticio.parse(body)
        const data = await getDataSheet(query.dni)
        const response: WrapperModel<typeof data> = {
            status: true,
            message: "Datos obtenidos correctamente",
            data
        }
        return new Response(JSON.stringify(response), { status: 200 })
}