import { query } from "@/lib/db";



// ==========================================

// 1. ENDPOINT GET: Listar todos los servicios

// ==========================================

export async function GET() {

 try {

  const res = await query('SELECT * FROM services ORDER BY "companyId" ASC');

  return Response.json(res.rows);

 } catch (error) {

  console.error("Error obteniendo servicios:", error);

  return Response.json({ error: "Error interno del servidor" }, { status: 500 });

 }

}



// ==========================================

// 2. ENDPOINT POST: Crear un nuevo servicio

// ==========================================

export async function POST(req: Request) {

 try {

  const body = await req.json();

  const { companyId, name, price, status } = body;



  // SOLUCIÓN AL BUG "Datos inconsistentes":

  // Validamos que vengan todos los campos y que el precio tenga sentido lógico.

  if (!companyId || !name || typeof price !== "number" || price <= 0) {

   return Response.json(

    { error: "Datos inconsistentes. Faltan campos o el precio es inválido." },

    { status: 400 }

   );

  }



  // SOLUCIÓN AL BUG "companyId incorrecto":

  // Antes de guardar, verificamos que la empresa exista realmente en la base de datos.

  const companyCheck = await query('SELECT id, status FROM companies WHERE id = $1', [companyId]);

   

  if (companyCheck.rows.length === 0) {

   return Response.json(

    { error: "El companyId proporcionado no existe en la base de datos." },

    { status: 404 }

   );

  }



  // Opcional pero recomendado: Una empresa rechazada no debería crear servicios

  if (companyCheck.rows[0].status === 'rejected') {

    return Response.json(

      { error: "No se pueden crear servicios para una empresa rechazada." },

      { status: 403 }

    );

  }



  // Definir estado por defecto si no viene

  const validStatus = status === "completed" ? "completed" : "active";



  // Insertar en la base de datos usando parámetros $1, $2 (previene inyecciones SQL)

  // Asumimos que la DB genera el ID automáticamente (ej. gen_random_uuid())

  const insertQuery = `

   INSERT INTO services ("companyId", name, status, price)

   VALUES ($1, $2, $3, $4)

   RETURNING *;

  `;

   

  const res = await query(insertQuery, [companyId, name, validStatus, price]);



  // Devolvemos el servicio creado con código 201 (Created)

  return Response.json(res.rows[0], { status: 201 });



 } catch (error) {

  console.error("Error creando servicio:", error);

  return Response.json({ error: "Error interno del servidor" }, { status: 500 });

 }

}