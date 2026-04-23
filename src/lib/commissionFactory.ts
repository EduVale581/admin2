// src/lib/commissionFactory.ts
import type { CommissionRules } from './contexts/ConfigurationContext';

// 1. LA FÁBRICA: Recibe el tipo de proveedor y las reglas dinámicas (Cero Hardcodeo)
export const createCommissionCalculator = (rules: CommissionRules) => {
  return (salesArray: number[]): number => {
    return salesArray.reduce((totalAccumulated, currentSaleAmount) => {
      let commissionForThisSale = 0;

      // Única lógica dinámica: Tasa Base vs Tasa de Nivel 1 (Tier 1)
      if (currentSaleAmount <= rules.tier1Threshold) {
        commissionForThisSale = currentSaleAmount * rules.baseRate;
      } else {
        const basePart = rules.tier1Threshold * rules.baseRate;
        const excessPart = (currentSaleAmount - rules.tier1Threshold) * rules.tier1Rate;
        commissionForThisSale = basePart + excessPart;
      }

      return totalAccumulated + commissionForThisSale;
    }, 0);
  };
};