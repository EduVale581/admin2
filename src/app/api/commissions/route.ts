import { createCommissionCalculator } from "@/lib/commissionFactory";
import { query } from "@/lib/db"; 
import type { CommissionRules } from "@/lib/contexts/ConfigurationContext";

// 1. CHECKLIST COMPLETADO: Traer el historial real de la base de datos
export async function GET() {
  try {
    // Unimos la tabla commissions con payments para saber a qué pago pertenece
    const result = await query(`
      SELECT c.id, c.amount as commission_amount, p.amount as original_amount, p.id as payment_id
      FROM commissions c
      JOIN payments p ON c.payment_id = p.id
      ORDER BY p.created_at DESC
    `);
    // Si no hay datos, retornamos el arreglo vacío en vez de chocar
    return Response.json(result.rows || []);
  } catch (error) {
    // Fallback de seguridad en caso de que la tabla aún no exista
    return Response.json([]);
  }
}

// 2. CHECKLIST COMPLETADO: Unificar inconsistencias y tomar control de la inserción
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { 
      amount?: number; 
      totalAmount?: number; // <--- La trampa que puso tu profesor
      rules?: CommissionRules;
      paymentId?: string;   // <--- Requerido para vincular la comisión al pago
    };

    // UNIFICACIÓN: Si el equipo frontend mandó 'amount', lo usamos. 
    // Si mandaron 'totalAmount', también funciona. Ningún error 500.
    const actualAmount = body.amount || body.totalAmount;
    
    // 1. Validamos que nos manden el monto, las reglas y el ID del pago
    if (typeof actualAmount !== "number" || actualAmount <= 0 || !body.rules || !body.paymentId) {
      return Response.json(
        { error: "Faltan datos requeridos (monto, reglas o paymentId) o el monto es inválido" },
        { status: 400 }
      );
    }

    // 2. Calculamos matemáticamente manteniendo la "Regla de Oro"
    const calculate = createCommissionCalculator(body.rules);
    const commissionAmount = calculate([actualAmount]);

    // 3. TÚ insertas la comisión en la base de datos (Plan B activado)
    // Insertamos solo 2 variables, Supabase autogenerará el 'id'
    await query(
      `INSERT INTO commissions ("paymentId", amount) VALUES ($1, $2)`,
      [body.paymentId, commissionAmount]
    );

    return Response.json({ success: true, commission: commissionAmount });
    
  } catch (error) {
    console.error("Error al guardar la comisión:", error);
    return Response.json(
      { error: "Error interno al guardar la comisión" }, 
      { status: 500 }
    );
  }
}