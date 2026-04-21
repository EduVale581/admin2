import Card from "@/components/Card";
import Link from "next/link";

export default function DashboardHome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1>Panel de Administración - PEPITO</h1>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "16px" 
      }}>
        <Card title="Gestión de Solicitudes">
          <p>Revisa y aprueba nuevas empresas.</p>
          <Link href="/dashboard/requests" style={{ color: "blue", textDecoration: "underline" }}>
            Ir a Solicitudes
          </Link>
        </Card>

        <Card title="Servicios y Pagos">
          <p>Administra servicios contratados y cobros vía Webpay.</p>
          <Link href="/dashboard/payments" style={{ color: "blue", textDecoration: "underline" }}>
            Ver Pagos
          </Link>
        </Card>

        <Card title="Liquidaciones">
          <p>Control de comisiones y pagos a prestadores.</p>
          <Link href="/dashboard/commissions" style={{ color: "blue", textDecoration: "underline" }}>
            Ver Comisiones
          </Link>
        </Card>
      </div>
    </div>
  );
}