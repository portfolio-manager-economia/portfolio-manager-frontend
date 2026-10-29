import HelpTooltip from "./HelpTooltip";
import { HELP } from "../data/help";

const COLUMN_HELP = {
  "Activo": HELP.ticker,
  "Cantidad / VN": `${HELP.quantity} En bonos, se muestra el valor nominal comprado.`,
  "Compra": "Es el precio de compra por unidad, en la moneda del activo. En bonos, es por cada 100 de valor nominal.",
  "Último precio": "Es la última cotización recibida, en la moneda del activo. Puede tener demora o corresponder al último cierre; revisá la fecha en la columna Cotización.",
  "Valor USD": HELP.total,
  "G/P USD": HELP.pnl,
  "G/P %": HELP.pnl,
  "Cotización": "Indica a qué fecha y hora corresponde el precio usado. Que hayas actualizado la pantalla no significa que el mercado haya publicado un precio nuevo.",
};

const money = (value) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" }).format(
    value,
  );

export default function PositionsTable({ positions, onDelete, onOpenModal }) {
  const complete = positions.every((p) => p.market_value != null);
  const totalCost = positions.reduce((sum, p) => sum + p.cost_basis_usd, 0);
  const totalValue = positions.reduce(
    (sum, p) => sum + (p.market_value ?? 0),
    0,
  );
  const pnl = totalValue - totalCost;
  const date = (value) =>
    value ? new Date(value).toLocaleString("es-AR") : "Sin cotización";
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl">
          <p className="text-sm text-slate-400">Valor total · USD <HelpTooltip label="Valor total en USD">{HELP.total}</HelpTooltip></p>
          <p className="text-3xl font-bold mt-2">
            {complete ? money(totalValue) : "No disponible"}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Costo histórico en USD: {money(totalCost)} <HelpTooltip label="Costo histórico en USD">{HELP.cost}</HelpTooltip>
          </p>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl">
          <p className="text-sm text-slate-400">Ganancia / pérdida · USD <HelpTooltip label="Ganancia o pérdida">{HELP.pnl}</HelpTooltip></p>
          <p
            className={`text-3xl font-bold mt-2 ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {complete ? money(pnl) : "No disponible"}
          </p>
          <p className="text-xs mt-2">
            {complete && totalCost > 0
              ? `${((pnl / totalCost) * 100).toFixed(2)}%`
              : "—"}
          </p>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl">
          <p className="text-sm text-slate-400">
            Posiciones registradas: {positions.length}
            <HelpTooltip label="Posiciones registradas">Cada compra cargada es una posición. Si compraste el mismo activo en dos fechas y cargaste ambas compras, se cuentan dos posiciones, aunque sea un solo activo distinto.</HelpTooltip>
          </p>
          <button
            onClick={onOpenModal}
            className="mt-4 w-full bg-emerald-600 rounded-lg p-3"
          >
            + Agregar posición
          </button>
        </div>
      </div>
      {!complete && (
        <p role="alert" className="text-amber-300 text-sm">
          Faltan cotizaciones o el tipo de cambio. El total y la rentabilidad se
          mostrarán cuando pueda valuarse toda la cartera.
        </p>
      )}
      <p className="text-xs text-slate-400">
        Precios en la moneda de cada activo; valuación y rentabilidad en USD.
        Las compras en ARS usan el MEP de compra guardado y el valor actual usa
        MEP vigente. Bonos: precio por 100 de valor nominal.
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
        {positions.length === 0 ? (
          <p className="p-10 text-center text-slate-400">
            Agregá tu primera posición para comenzar.
          </p>
        ) : (
          <table className="w-full text-sm text-right">
            <thead className="text-slate-400">
              <tr>
                {[
                  "Activo",
                  "Cantidad / VN",
                  "Compra",
                  "Último precio",
                  "Valor USD",
                  "G/P USD",
                  "G/P %",
                  "Cotización",
                  "",
                ].map((label, i) => (
                  <th className="p-3 whitespace-nowrap" key={i}>
                    {label}
                    {COLUMN_HELP[label] && <HelpTooltip label={label}>{COLUMN_HELP[label]}</HelpTooltip>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-t border-slate-800">
                  <td className="p-3 font-mono">
                    <strong>{p.ticker}</strong>
                    <div className="text-xs text-slate-400">
                      {p.asset_type} · {p.currency}
                    </div>
                  </td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3 whitespace-nowrap">
                    {p.currency} {p.buy_price.toFixed(2)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {p.current_price != null
                      ? `${p.currency} ${p.current_price.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="p-3">
                    {p.market_value != null ? money(p.market_value) : "—"}
                  </td>
                  <td className="p-3">
                    {p.unrealized_pnl != null ? money(p.unrealized_pnl) : "—"}
                  </td>
                  <td className="p-3">
                    {p.unrealized_pnl_pct != null
                      ? `${(p.unrealized_pnl_pct * 100).toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="p-3 text-xs text-slate-400">
                    {date(p.quote_at)}
                    {p.quote_error && (
                      <p className="text-amber-300" role="status">
                        {p.quote_error}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      aria-label={`Eliminar ${p.ticker}`}
                      onClick={() => onDelete(p.id)}
                      className="text-rose-400"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
