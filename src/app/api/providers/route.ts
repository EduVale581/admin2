import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query<{
      id: string;
      payment_id: string;
      provider_name: string;
      amount: number;
      status: string;
    }>(`
      SELECT id, payment_id, provider_name, amount, status
      FROM provider_payments
      ORDER BY id DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error GET /api/providers:", error);
    return Response.json(
      { error: "Error al obtener pagos a prestadores" },
      { status: 500 }
    );
  }
}

const PROVIDER_SHARE = 0.90;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      paymentId?: string;
      providerName?: string;
    };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!body.paymentId || !uuidRegex.test(body.paymentId) || !body.providerName) {
      return Response.json(
        { error: "paymentId (válido) y providerName son requeridos" },
        { status: 400 }
      );
    }

    const paymentResult = await query<{
      id: string;
      amount: number;
      status: string;
    }>(
      `SELECT id, amount, status FROM payments WHERE id = $1`,
      [body.paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return Response.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const payment = paymentResult.rows[0];

    if (payment.amount <= 0) {
      return Response.json(
        { error: "El monto debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT id FROM provider_payments WHERE payment_id = $1`,
      [body.paymentId]
    );

    if (existing.rows.length > 0) {
      return Response.json(
        { error: "Ya existe un pago para este paymentId" },
        { status: 409 }
      );
    }

    const providerAmount = payment.amount * PROVIDER_SHARE;

    const result = await query<{
      id: string;
      payment_id: string;
      provider_name: string;
      amount: number;
      status: string;
    }>(
      `INSERT INTO provider_payments (payment_id, provider_name, amount, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, payment_id, provider_name, amount, status`,
      [body.paymentId, body.providerName, providerAmount]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error POST /api/providers:", error);
    return Response.json(
      { error: "Error al crear pago a prestador" },
      { status: 500 }
    );
  }
}