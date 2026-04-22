"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useConfiguration } from '@/lib/contexts/ConfigurationContext';
import { createCommissionCalculator } from '@/lib/commissionFactory';
import { ConfigurationPanel } from '@/components/ConfigurationPanel';

// Definimos la estructura que nos manda la Base de Datos
type CommissionRecord = {
  id: string;
  payment_id: string;
  original_amount: number;
  commission_amount: number;
};

export default function CommissionsPage() {
  // Inicializamos data para la tabla
  const [data, setData] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { commissionRules } = useConfiguration();
  const [transactionValue, setTransactionValue] = useState(1500);

  useEffect(() => {
    // Hacemos el fetch real y apagamos el cargando
    api.get("/api/commissions")
      .then((res) => {
         setData(res as CommissionRecord[] || []);
         setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const calculate = createCommissionCalculator(commissionRules);
  const currentCommission = calculate([transactionValue]);

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h1>Gestión de Comisiones Dinámicas</h1>

      {/* PARTE SUPERIOR: Tu motor dinámico para demostrar adaptabilidad */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <ConfigurationPanel />
        </div>

        <div style={{ flex: 1, minWidth: '300px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Simulador de Cálculo Unificado</h2>
          <p style={{ color: '#475569', fontSize: '14px' }}>
            La comisión se calcula usando los tramos definidos en el panel global.
          </p>
          <div style={{ marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Valor del Pago (Prueba):</label>
            <input
              type="number"
              value={transactionValue}
              onChange={(e) => setTransactionValue(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', marginTop: '8px', border: '1px solid gray', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginTop: '20px', padding: '20px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#166534' }}>
              Comisión a Pagar: ${currentCommission.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      {/* PARTE INFERIOR: CHECKLIST COMPLETADO (Tabla de Historial) */}
      <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h2>Historial de Comisiones Generadas</h2>
        <p>Listado de comisiones vinculadas a los pagos registrados en la plataforma.</p>
        
        {loading ? (
           <p>Cargando datos de la base...</p>
        ) : data.length === 0 ? (
           <p style={{ fontStyle: 'italic', color: 'gray' }}>No hay comisiones registradas. ¡Prueba a crear un pago primero!</p>
        ) : (
           <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', backgroundColor: 'white', border: '1px solid #ddd' }}>
             <thead>
               <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                 <th style={{ padding: '12px' }}>ID Comisión</th>
                 <th style={{ padding: '12px' }}>ID Pago (Referencia)</th>
                 <th style={{ padding: '12px' }}>Monto Pagado</th>
                 <th style={{ padding: '12px', color: '#166534' }}>Comisión Cobrada</th>
               </tr>
             </thead>
             <tbody>
               {data.map((record) => (
                 <tr key={record.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                   {/* Mostramos solo los primeros 8 caracteres del ID para que no se vea feo */}
                   <td style={{ padding: '12px', fontFamily: 'monospace' }}>{record.id.slice(0, 8)}...</td>
                   <td style={{ padding: '12px', fontFamily: 'monospace' }}>{record.payment_id.slice(0, 8)}...</td>
                   <td style={{ padding: '12px' }}>${record.original_amount}</td>
                   <td style={{ padding: '12px', fontWeight: 'bold', color: '#166534' }}>
                     ${record.commission_amount}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </main>
  );
}