import { query } from "@/lib/db";
import { createCommissionCalculator } from "@/lib/commissionFactory";
import type { CommissionRules } from "@/lib/contexts/ConfigurationContext";

type CreatePaymentBody = {
  serviceId: string;
  amount: number;
  rules: CommissionRules; // <-- Añadimos las reglas al tipo
};

export async function GET() {
  try {
    const sql = `

   SELECT * 

   FROM payments
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

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CreatePaymentBody>;

  // 1. SOLUCIÓN TÉCNICA: Validar que todos los datos existan antes de hacer cálculos
  if (!body.amount || !body.serviceId || !body.rules) {
    return Response.json(
      { error: "Faltan datos requeridos (serviceId, amount o rules)" },
      { status: 400 }
    );
  }

  // 2. SOLUCIÓN DE NEGOCIO: Aplicar Regla de Oro (Cero hardcoding)
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
    [body.serviceId, body.amount],
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
    [payment.id, commissionAmount], // Usamos el valor dinámico
  );

  return Response.json({
    ok: true,
    payment,
    commission: commissionResult.rows[0],
  });
}
