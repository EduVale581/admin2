import { query } from "@/lib/db";

// ==========================================

// 1. ENDPOINT GET

// ==========================================

export async function GET() {
  try {
    

    const sql = `

   SELECT id, company_id AS "companyId", name, status, price 

   FROM services 

   ORDER BY company_id ASC

  `;

    const res = await query(sql);

    return Response.json(res.rows);
  } catch (error) {
    console.error("Error obteniendo servicios:", error);

    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// ==========================================

// 2. ENDPOINT POST

// ==========================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { companyId, name, price, status } = body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!companyId || !uuidRegex.test(companyId) || !name || typeof price !== "number" || price <= 0) {
      return Response.json({ error: "Datos inconsistentes o ID inválido." }, { status: 400 });
    }

    const companyCheck = await query("SELECT id FROM companies WHERE id = $1", [
      companyId,
    ]);

    if (companyCheck.rows.length === 0) {
      return Response.json(
        { error: "El companyId no existe." },
        { status: 404 },
      );
    }

    const validStatus = status === "completed" ? "completed" : "active";

    // FIX: Insertamos en company_id, y retornamos mapeado a "companyId"

    const insertQuery = `

   INSERT INTO services (company_id, name, status, price)

   VALUES ($1, $2, $3, $4)

   RETURNING id, company_id AS "companyId", name, status, price;

  `;

    const res = await query(insertQuery, [companyId, name, validStatus, price]);

    return Response.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creando servicio:", error);

    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
