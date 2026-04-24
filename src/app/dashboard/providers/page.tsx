"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Table from "@/components/Table";

export default function ProvidersPage() {
  const [data, setData] = useState<unknown[]>([]);

  useEffect(() => {
    api.get("/api/providers").then(setData);
  }, []);

  return (
    <div className="container">
      <h1>Pagos a Proveedores</h1>
      <Table data={data} />
    </div>
  );
}