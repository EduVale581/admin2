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