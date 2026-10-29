import { supabase } from "./supabase";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

async function request(path, { authenticated = true, ...options } = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (authenticated) {
    const { data, error } = supabase
      ? await supabase.auth.getSession()
      : { data: {} };
    if (error || !data.session)
      throw new Error("Iniciá sesión para continuar.");
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    signal: options.signal || AbortSignal.timeout(180000),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg).join("; ")
          : "No se pudo completar la operación.",
    );
  }
  return body;
}

export const fetchHealth = () => request("/health", { authenticated: false });
export const fetchDolarRates = (refresh = false) =>
  request(`/market/dolar?refresh=${refresh}`, { authenticated: false });
export const fetchPositions = (refresh = false) =>
  request(`/positions?refresh=${refresh}`);
export const createPosition = (position) =>
  request("/positions", { method: "POST", body: JSON.stringify(position) });
export const deletePosition = (id) =>
  request(`/positions/${id}`, { method: "DELETE" });
export const optimizePortfolio = (
  tickers,
  riskFreeRate = 0.04,
  period = "1y",
  compareCurrent = false,
) =>
  request("/optimize", {
    method: "POST",
    body: JSON.stringify({
      tickers,
      risk_free_rate: riskFreeRate,
      period,
      allow_short: false,
      compare_current: compareCurrent,
    }),
  });
