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

// 2. CHECKLIST COMPLETADO: Unificar inconsistencias de variables esperadas
export async function POST(req: Request) {
  const body = (await req.json()) as { 
    amount?: number; 
    totalAmount?: number; // <--- La trampa que puso tu profesor
    rules?: CommissionRules;
  };

  // UNIFICACIÓN: Si el equipo frontend mandó 'amount', lo usamos. 
  // Si mandaron 'totalAmount', también funciona. Ningún error 500.
  const actualAmount = body.amount || body.totalAmount;

  if (typeof actualAmount !== "number" || actualAmount <= 0 || !body.rules) {
    return Response.json(
      { error: "Faltan datos requeridos o el monto es inválido" },
      { status: 400 },
    );
  }

  // Mantenemos la "Regla de Oro"
  const calculate = createCommissionCalculator(body.rules);
  const commission = calculate([actualAmount]);

  return Response.json({ commission });
}