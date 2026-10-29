import React from "react";
import { ShieldCheck, Zap } from "lucide-react";

export default function OptimalPortfoliosCard({ gmvp, tangency }) {
  if (!gmvp || !tangency) return null;

  const renderWeights = (weights) => {
    return Object.entries(weights)
      .filter((entry) => entry[1] > 0.001)
      .map(([ticker, w]) => (
        <div
          key={ticker}
          className="flex justify-between items-center text-xs py-1 border-b border-slate-700/50"
        >
          <span className="font-mono text-slate-300 font-medium">{ticker}</span>
          <span className="font-mono text-white font-bold">
            {(w * 100).toFixed(1)}%
          </span>
        </div>
      ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Portafolio de Mínima Varianza */}
      <div className="bg-slate-800/80 p-5 rounded-xl border border-purple-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="text-purple-400" size={22} />
          <h4 className="font-bold text-white text-base">
            Mínima Varianza (GMVP)
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Minimiza la volatilidad total sin importar el retorno. Ideal para
          perfiles conservadores.
        </p>

        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-lg mb-4 text-center">
          <div>
            <div className="text-[10px] uppercase text-slate-500">
              Retorno Anual
            </div>
            <div className="font-mono text-sm font-bold text-purple-300">
              {(gmvp.expected_return * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-500">
              Volatilidad
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {(gmvp.volatility * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-500">Sharpe</div>
            <div className="font-mono text-sm font-bold text-amber-400">
              {gmvp.sharpe_ratio.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold uppercase text-slate-400 mb-2">
          Composición Óptima:
        </div>
        <div className="bg-slate-900/40 p-2 rounded-lg max-h-40 overflow-y-auto">
          {renderWeights(gmvp.weights)}
        </div>
      </div>

      {/* Portafolio de Máximo Sharpe */}
      <div className="bg-slate-800/80 p-5 rounded-xl border border-emerald-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="text-emerald-400" size={22} />
          <h4 className="font-bold text-white text-base">
            Máximo Ratio de Sharpe (Tangencia)
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Ofrece la mayor rentabilidad ajustada por cada unidad de riesgo
          asumida.
        </p>

        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-lg mb-4 text-center">
          <div>
            <div className="text-[10px] uppercase text-slate-500">
              Retorno Anual
            </div>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {(tangency.expected_return * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-500">
              Volatilidad
            </div>
            <div className="font-mono text-sm font-bold text-white">
              {(tangency.volatility * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-500">Sharpe</div>
            <div className="font-mono text-sm font-bold text-amber-400">
              {tangency.sharpe_ratio.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold uppercase text-slate-400 mb-2">
          Composición Óptima:
        </div>
        <div className="bg-slate-900/40 p-2 rounded-lg max-h-40 overflow-y-auto">
          {renderWeights(tangency.weights)}
        </div>
      </div>
    </div>
  );
}
