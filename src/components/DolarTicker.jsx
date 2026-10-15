import React, { useEffect, useState } from "react";
import { fetchDolarRates } from "../api/client";

export default function DolarTicker() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDolarRates()
      .then((data) => {
        setRates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando dólares:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !rates) {
    return (
      <div className="bg-slate-800 text-slate-300 text-xs py-2 px-4 flex gap-4 overflow-x-auto border-b border-slate-700">
        <span>Cargando cotizaciones de Argentina...</span>
      </div>
    );
  }

  const items = [
    { label: "Dólar Oficial", key: "oficial" },
    { label: "Dólar MEP (Bolsa)", key: "bolsa" },
    { label: "Dólar CCL", key: "contadoconliqui" },
    { label: "Dólar Blue", key: "blue" },
    { label: "Cripto", key: "cripto" },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-6 flex items-center gap-6 overflow-x-auto text-slate-400">
      <span className="font-semibold text-emerald-400 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Cotizaciones Dólar (dolarapi.com):
      </span>
      {items.map(({ label, key }) => {
        const item = rates[key];
        if (!item) return null;
        return (
          <div key={key} className="flex gap-2 items-center whitespace-nowrap">
            <span className="font-medium text-slate-300">{label}:</span>
            <span className="text-white font-mono">
              ${item.venta || item.compra || "-"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

