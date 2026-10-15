import React from "react";
import { Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function PositionsTable({ positions, onDelete, onOpenModal }) {
  const totalValue = positions.reduce((acc, p) => acc + (p.market_value || p.quantity * p.buy_price), 0);
  const totalCost = positions.reduce((acc, p) => acc + (p.quantity * p.buy_price), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Valor Total del Portafolio</div>
          <div className="text-3xl font-bold font-mono text-white mt-1">
            ${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-2">Costo invertido: ${totalCost.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Ganancia / Pérdida Total</div>
          <div className={`text-3xl font-bold font-mono mt-1 flex items-center gap-2 ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnL >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
            ${Math.abs(totalPnL).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs font-semibold mt-2 ${totalPnLPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%
          </div>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Activos Registrados</div>
            <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">{positions.length}</div>
          </div>
          <button
            onClick={onOpenModal}
            className="w-full mt-3 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            + Agregar Posición
          </button>
        </div>
      </div>

      {/* Tabla de Activos */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-white">Posiciones Actuales</h3>
          <span className="text-xs text-slate-400">Valuación con datos de mercado</span>
        </div>

        {positions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-medium">No hay activos registrados en tu cartera.</p>
            <p className="text-xs text-slate-500 mt-1">Hacé clic en "+ Agregar Posición" para comenzar a armar tu portafolio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Cantidad</th>
                  <th className="py-3 px-4 text-right">Precio Compra</th>
                  <th className="py-3 px-4 text-right">Precio Actual</th>
                  <th className="py-3 px-4 text-right">Valuación</th>
                  <th className="py-3 px-4 text-right">G / P (%)</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {positions.map((p) => {
                  const pnl = p.unrealized_pnl || 0;
                  const pnlPct = (p.unrealized_pnl_pct || 0) * 100;
                  return (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white font-mono">{p.ticker}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs uppercase font-medium bg-slate-700 text-slate-300">
                          {p.asset_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{p.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">${p.buy_price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-white font-medium">
                        ${p.current_price ? p.current_price.toFixed(2) : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-white font-semibold">
                        ${p.market_value ? p.market_value.toLocaleString("es-AR", { minimumFractionDigits: 2 }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={`font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Eliminar posición"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

