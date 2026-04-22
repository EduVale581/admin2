// src/components/ConfigurationPanel.tsx
'use client';

import React, { useState } from 'react';
import { useConfiguration } from '@/lib/contexts/ConfigurationContext';

export const ConfigurationPanel = () => {
  const { commissionRules, updateCommissionRules } = useConfiguration();

  // CORRECCIÓN: Usamos .toFixed(2) envuelto en Number() para limpiar la basura decimal, 
  // pero permitiendo conservar hasta 2 decimales reales (ej: 7.50)
  const [baseRate, setBaseRate] = useState(Number((commissionRules.baseRate * 100).toFixed(2))); 
  const [tier1Threshold, setTier1Threshold] = useState(commissionRules.tier1Threshold);
  const [tier1Rate, setTier1Rate] = useState(Number((commissionRules.tier1Rate * 100).toFixed(2)));

  const handleSave = () => {
    updateCommissionRules({
      baseRate: baseRate / 100,
      tier1Threshold,
      tier1Rate: tier1Rate / 100,
    });
    alert('Comisión actualizada con exito.');
  };

  return (
    <div style={{ border: '1px solid gray', padding: '20px', borderRadius: '8px', maxWidth: '400px' }}>
      <h2>Simulación de Cálculo (Sin Valores Fijos)</h2>
      <div style={{ marginBottom: '15px' }}>
        <label>Comisión Base (%):</label>
        <input
          type="number"
          step="0.01" /* PERMITE ESCRIBIR DECIMALES EN EL NAVEGADOR */
          value={baseRate}
          onChange={(e) => setBaseRate(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Monto de pago para sobre comisión:</label>
        <input
          type="number"
          step="0.01"
          value={tier1Threshold}
          onChange={(e) => setTier1Threshold(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Valor sobre comisión (%):</label>
        <input
          type="number"
          step="0.01"
          value={tier1Rate}
          onChange={(e) => setTier1Rate(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <button
        onClick={handleSave}
        style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Modificar Tasa de comisión
      </button>
    </div>
  );
};