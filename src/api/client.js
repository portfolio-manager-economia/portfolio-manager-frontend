/**
 * Cliente HTTP para comunicarse con el backend de FastAPI.
 */

const API_BASE = "http://localhost:8000/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDolarRates() {
  const res = await fetch(`${API_BASE}/market/dolar`);
  return res.json();
}

export async function fetchPositions() {
  const res = await fetch(`${API_BASE}/positions`);
  if (!res.ok) throw new Error("Error al consultar posiciones");
  return res.json();
}

export async function createPosition(positionData) {
  const res = await fetch(`${API_BASE}/positions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(positionData),
  });
  if (!res.ok) throw new Error("Error al crear posición");
  return res.json();
}

export async function deletePosition(id) {
  const res = await fetch(`${API_BASE}/positions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar posición");
  return res.json();
}

export async function optimizePortfolio(tickers, riskFreeRate = 0.04, period = "1y") {
  const res = await fetch(`${API_BASE}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tickers,
      risk_free_rate: riskFreeRate,
      allow_short: false,
      period,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Error en la optimización" }));
    throw new Error(errorData.detail || "Error en la optimización");
  }
  return res.json();
}

