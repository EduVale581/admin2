"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/Card";
import type { Request as AppRequest } from "@/lib/types";

export default function RequestsPage() {
  const [data, setData] = useState<AppRequest[]>([]);

  const loadData = () => {
    api.get("/api/requests").then((res) => {
      if (Array.isArray(res)) {
        setData(res);
      } else {
        setData([]);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const res = await api.post(`/api/requests/${id}/${action}`, {});
    if (res && !res.error) {
      loadData();
    } else {
      alert(`Error: ${res?.error || "Desconocido"}`);
    }
  };

  return (
    <Card title="Solicitudes de Empresa">
      {!data || data.length === 0 ? (
        <p>Sin datos disponibles</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((req: any) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.name}</td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: req.status === "approved" ? "#e8f5e9" : req.status === "rejected" ? "#ffebee" : "#fff3e0",
                    color: req.status === "approved" ? "#2e7d32" : req.status === "rejected" ? "#c62828" : "#ef6c00"
                  }}>
                    {req.status}
                  </span>
                </td>
                <td>{req.created_at ? new Date(req.created_at).toLocaleString() : ""}</td>
                <td>
                  {req.status === "pending" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => handleAction(req.id, "approve")}
                        style={{ background: "#4caf50", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, "reject")}
                        style={{ background: "#f44336", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        Rechazar
                      </button>
                    </div>
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
