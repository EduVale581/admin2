"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Table from "@/components/Table";

export default function ServicesPage() {
  // ESTADO ORIGINAL
  const [data, setData] = useState<unknown[]>([]);

  // NUEVO ESTADO: Para capturar los datos del formulario
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  // MODIFICACIÓN MENOR: Encapsulamos tu llamada original para poder re-usarla
  const loadServices = () => {
    api.get("/api/services").then(setData);
  };

  // EFECTO ORIGINAL (pero llamando a la función encapsulada)
  useEffect(() => {
    loadServices();
  }, []);

  // NUEVO: Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Usamos fetch nativo aquí para el POST, así evitamos el bug intencional de api.ts (faltan headers)
      // sin tener que modificar el archivo global api.ts y romperle el código a otros equipos.
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, companyId, price: Number(price) }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Error al crear el servicio");
        return;
      }

      // Éxito: Limpiamos los inputs y volvemos a cargar la tabla
      setName("");
      setCompanyId("");
      setPrice("");
      loadServices(); 

    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Servicios</h1>

      {/* NUEVO: Formulario inyectado antes de la tabla original */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input 
          placeholder="Nombre del servicio" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          placeholder="ID de la Empresa" 
          value={companyId} 
          onChange={(e) => setCompanyId(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          placeholder="Precio" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          required 
          min="1"
        />
        <button type="submit">Crear</button>
      </form>
      
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TABLA ORIGINAL INTACTA */}
      <Table data={data} />
    </div>
  );
}