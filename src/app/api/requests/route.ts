import { query } from "@/lib/db";
import type { Request as AppRequest } from "@/lib/types";

export async function GET() {
    try {
        // CORRECCIÓN: Cambiamos "requests" por "companies"
        const result = await query<AppRequest>("SELECT * FROM companies ORDER BY id DESC");

        return Response.json(result.rows, { status: 200 });
    } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        return Response.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}