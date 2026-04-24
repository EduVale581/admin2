"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import Table from "@/components/Table";
import styles from "./page.module.css";

interface Service {
  name: string;
  id: string;
  price: number;
}

export default function PaymentsPage() {
  const [data, setData] = useState<unknown[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Nuevo estado para el monto del pago
  const [amount, setAmount] = useState<number | string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/api/services").then(setServices);
    api.get("/api/payments").then(setData);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (service: Service) => {
    setSelectedService(service);
    setAmount(service.price); // Al seleccionar, se auto-rellena el monto
    setIsOpen(false);
  };

  const createPayment = async () => {
    if (!selectedService || !amount) return;

    await api.post("/api/payments", {
      amount: Number(amount),
      serviceId: selectedService.id
    });

    const updatedData = await api.get("/api/payments");
    setData(updatedData);
    setSelectedService(null);
    setAmount("");
  };

  return (
    <div className={styles['page-container']}>
      <div className={styles['form-group']}>
        <div className={styles['dropdown-container']} ref={dropdownRef} style={{ position: "relative" }}>
          <button className={styles['dropdown-button']} onClick={toggleDropdown} type="button">
            {selectedService ? selectedService.name : "Selecciona un servicio"}
          </button>

          {isOpen && (
            <ul className={styles['dropdown-menu']} style={{ position: "absolute", zIndex: 10 }}>
              {services.map((service) => (
                <li
                  key={service.id}
                  onClick={() => handleOptionClick(service)}
                  className={styles['dropdown-item']}
                >
                  {service.name} - ${service.price}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Nuevo Input de Monto */}
        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles['amount-input']}
          style={{ marginLeft: "10px", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      <button
        onClick={createPayment}
        disabled={!selectedService || !amount}
        style={{ marginTop: "10px", display: "block" }}
      >
        Crear pago
      </button>

      <Table data={data} />
    </div>
  );
}
