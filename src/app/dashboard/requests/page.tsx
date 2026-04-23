"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";
import RequestActions from "@/components/RequesActions";

// Definimos la estructura de los datos que llegan de la base de datos
interface CompanyRequest {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
}

export default function RequestsPage() {
  const [data, setData] = useState<CompanyRequest[]>([]);

  // Creamos una función separada para poder llamarla después de aprobar/rechazar
  const fetchRequests = () => {
    api.get("/api/requests").then(setData);
  };

  // Carga inicial de los datos
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Card title="Solicitudes de Empresa">
      {data.length === 0 ? (
        <p>Cargando datos o no hay solicitudes registradas...</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th>ID</th>
              <th>Nombre de Empresa</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.name}</td>
                <td style={{
                  color: req.status === 'approved' ? 'green' : req.status === 'rejected' ? 'red' : '#eab308',
                  fontWeight: 'bold'
                }}>
                  {req.status.toUpperCase()}
                </td>
                <td>
                  {/* Solo mostramos los botones si el estado es 'pending' */}
                  {req.status === "pending" ? (
                     <RequestActions 
                        requestId={req.id} 
                        onActionComplete={fetchRequests} 
                     />
                  ) : (
                     <span style={{ color: "gray" }}>Gestionada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}