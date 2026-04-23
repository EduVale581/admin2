"use client";

import { useState } from "react";
import { api } from "@/lib/api"; //

interface Props {
  requestId: string;
  onActionComplete: () => void;
}

export default function RequestActions({ requestId, onActionComplete }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    // Confirmación de seguridad para rechazos
    if (action === "reject" && !confirm("¿Estás seguro de que deseas rechazar esta solicitud?")) {
      return;
    }

    setIsProcessing(true);
    try {
      // Llamada a los endpoints del backend
      await api.post(`/api/requests/${requestId}/${action}`, {});
      onActionComplete(); // Refrescar la tabla en el padre
    } catch (error) {
      alert("Error al procesar la solicitud");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => handleAction("approve")}
        disabled={isProcessing}
        style={{
          backgroundColor: isProcessing ? "#ccc" : "#4caf50",
          color: "white",
          padding: "6px 12px",
          border: "none",
          borderRadius: "4px",
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
      >
        {isProcessing ? "..." : "Aprobar"}
      </button>

      <button
        onClick={() => handleAction("reject")}
        disabled={isProcessing}
        style={{
          backgroundColor: isProcessing ? "#ccc" : "#f44336",
          color: "white",
          padding: "6px 12px",
          border: "none",
          borderRadius: "4px",
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
      >
        {isProcessing ? "..." : "Rechazar"}
      </button>
    </div>
  );
}