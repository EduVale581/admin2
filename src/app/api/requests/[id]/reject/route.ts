import { query } from "@/lib/db";
import type { Request as AppRequest } from "@/lib/types";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verificamos estado actual
        const check = await query<AppRequest>("SELECT status FROM companies WHERE id = $1", [id]);

        if (check.rowCount === 0) {
            return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
        }

        if (check.rows[0].status !== "pending") {
            return Response.json({ error: "No se puede rechazar una solicitud ya procesada" }, { status: 400 });
        }

        // 2. Actualizamos el estado a 'rejected'
        const update = await query<AppRequest>(
            "UPDATE companies SET status = 'rejected' WHERE id = $1 RETURNING *",
            [id]
        );

        return Response.json({
            message: "Solicitud rechazada",
            data: update.rows[0]
        });
    } catch (error) {
        console.error("Error al rechazar solicitud:", error);
        return Response.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}