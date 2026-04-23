// src/lib/contexts/ConfigurationContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interfaz para definir las reglas de negocio variables
export interface CommissionRules {
  baseRate: number; // Ej: 0.05 para 5%
  tier1Threshold: number; // Ej: 1000
  tier1Rate: number; // Ej: 0.07 para 7%
}

// Interfaz para el estado y las funciones del contexto
interface ConfigurationContextType {
  commissionRules: CommissionRules;
  updateCommissionRules: (newRules: Partial<CommissionRules>) => void;
}

// Reglas por defecto para inicializar el sistema (¡NUNCA las uses para cálculos reales!)
const DEFAULT_COMMISSION_RULES: CommissionRules = {
  baseRate: 0.05,
  tier1Threshold: 1000,
  tier1Rate: 0.07,
};

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export const ConfigurationProvider = ({ children }: { children: ReactNode }) => {
  const [commissionRules, setCommissionRules] = useState<CommissionRules>(DEFAULT_COMMISSION_RULES);

  const updateCommissionRules = (newRules: Partial<CommissionRules>) => {
    setCommissionRules((prevRules) => ({ ...prevRules, ...newRules }));
  };

  return (
    <ConfigurationContext.Provider value={{ commissionRules, updateCommissionRules }}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};