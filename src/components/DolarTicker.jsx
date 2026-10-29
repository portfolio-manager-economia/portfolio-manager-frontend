import { useEffect, useState } from "react";
import { fetchDolarRates } from "../api/client";

export default function DolarTicker() {
  const [rates, setRates] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true,
      pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const data = await fetchDolarRates();
        if (alive) {
          setRates(data);
          setError("");
        }
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        pending = false;
      }
    }
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);
  const items = [
    ["Oficial", "oficial"],
    ["MEP", "bolsa"],
    ["CCL", "contadoconliqui"],
    ["Blue", "blue"],
    ["Cripto", "cripto"],
  ];
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-6 flex gap-6 overflow-x-auto text-slate-300">
      <span className="text-emerald-400 whitespace-nowrap">
        Dólar · DolarAPI · consulta cada 60 s
      </span>
      {!rates && !error && <span>Cargando…</span>}
      {items.map(
        ([label, key]) =>
          rates?.[key] && (
            <span
              key={key}
              className="whitespace-nowrap"
              title={`Fecha del proveedor: ${rates[key].fechaActualizacion || "No informada"}`}
            >
              {label}: ${rates[key].venta ?? "—"}
              <small className="text-slate-500 ml-2">
                {rates[key].fechaActualizacion
                  ? new Date(rates[key].fechaActualizacion).toLocaleString(
                      "es-AR",
                    )
                  : "Sin fecha"}
              </small>
            </span>
          ),
      )}
      {error && (
        <span role="alert" className="text-amber-300">
          {error}
          {rates
            ? " Se muestran las últimas cotizaciones recibidas; pueden estar desactualizadas."
            : ""}
        </span>
      )}
    </div>
  );
}
