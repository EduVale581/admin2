import { query } from "@/lib/db";
import { createCommissionCalculator } from "@/lib/commissionFactory";
import type { CommissionRules } from "@/lib/contexts/ConfigurationContext";

type CreatePaymentBody = {
  serviceId: string;
  amount: number;
  rules: CommissionRules; // <-- Añadimos las reglas al tipo
};

// Ruta para el POST (crear pago y comisión)
export async function POST(req: Request) {
  const body = await req.json() as Partial<CreatePaymentBody>;

  // Validar que todos los datos existan antes de hacer cálculos
  if (!body.amount || !body.serviceId || !body.rules) {
    return Response.json({ error: "Faltan datos requeridos (serviceId, amount o rules)" }, { status: 400 });
  }

  // Aplicar la regla de negocio para calcular la comisión
  const calculate = createCommissionCalculator(body.rules);
  const commissionAmount = calculate([body.amount]);

  // Insertar el pago en la base de datos
  const paymentResult = await query<{
    id: string;
    service_id: string;
    amount: number;
    status: string;
    created_at: string;
  }>(
    `
    insert into payments (service_id, amount, status)
    values ($1, $2, 'pending')
    returning id, service_id, amount, status, created_at
  `,
    [body.serviceId, body.amount]
  );

  const payment = paymentResult.rows[0];

  // Insertar la comisión calculada dinámicamente en la base de datos
  const commissionResult = await query<{
    id: string;
    payment_id: string;
    amount: number;
  }>(
    `
    insert into commissions (payment_id, amount)
    values ($1, $2)
    returning id, payment_id, amount
  `,
    [payment.id, commissionAmount] // Usamos el valor dinámico
  );

  return Response.json({
    ok: true,
    payment,
    commission: commissionResult.rows[0],
  });
}

// Ruta para el GET (obtener todos los pagos)
export async function GET(req: Request) {
  try {
    // Consultar todos los pagos en la base de datos
    const result = await query(`
      SELECT * FROM payments;
    `);

    // Devolver los pagos en formato JSON
    return Response.json(result.rows); 
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return Response.json({ error: "Error al obtener pagos" }, { status: 500 });
  }
}