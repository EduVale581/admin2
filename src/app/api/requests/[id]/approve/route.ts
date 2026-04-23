import { query } from "@/lib/db";
import type { Request as AppRequest } from "@/lib/types";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verificamos que la solicitud exista y esté en estado 'pending'
        const check = await query<AppRequest>("SELECT status FROM requests WHERE id = $1", [id]);

        if (check.rowCount === 0) {
            return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
        }

        if (check.rows[0].status !== "pending") {
            return Response.json({ error: "La solicitud ya ha sido procesada" }, { status: 400 });
        }

        // 2. Actualizamos el estado a 'approved'
        const update = await query<AppRequest>(
            "UPDATE requests SET status = 'approved' WHERE id = $1 RETURNING *",
            [id]
        );

        return Response.json({
            message: "Solicitud aprobada con éxito",
            data: update.rows[0]
        });
    } catch (error) {
        console.error("Error al aprobar solicitud:", error);
        return Response.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}