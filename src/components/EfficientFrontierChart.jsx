import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function EfficientFrontierChart({ frontierData, gmvp, tangency, currentPortfolio }) {
  if (!frontierData || frontierData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500 text-sm">
        No hay datos suficientes para graficar la Frontera Eficiente. Seleccioná al menos 2 activos y ejecutá la optimización.
      </div>
    );
  }

  // Formatear datos a porcentajes
  const curveData = frontierData.map((pt) => ({
    volatility: Number((pt.volatility * 100).toFixed(2)),
    return: Number((pt.expected_return * 100).toFixed(2)),
    sharpe: Number(pt.sharpe_ratio.toFixed(2)),
  }));

  const gmvpPoint = gmvp
    ? [
        {
          volatility: Number((gmvp.volatility * 100).toFixed(2)),
          return: Number((gmvp.expected_return * 100).toFixed(2)),
          sharpe: Number(gmvp.sharpe_ratio.toFixed(2)),
          name: "Mínima Varianza (GMVP)",
        },
      ]
    : [];

  const tangencyPoint = tangency
    ? [
        {
          volatility: Number((tangency.volatility * 100).toFixed(2)),
          return: Number((tangency.expected_return * 100).toFixed(2)),
          sharpe: Number(tangency.sharpe_ratio.toFixed(2)),
          name: "Máximo Sharpe (Tangencia)",
        },
      ]
    : [];

  const currentPoint = currentPortfolio
    ? [
        {
          volatility: Number((currentPortfolio.volatility * 100).toFixed(2)),
          return: Number((currentPortfolio.expected_return * 100).toFixed(2)),
          sharpe: Number(currentPortfolio.sharpe_ratio.toFixed(2)),
          name: "Tu Portafolio Actual",
        },
      ]
    : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
          {data.name && <div className="font-bold text-white mb-1">{data.name}</div>}
          <div className="text-slate-300">
            Volatilidad (Riesgo $\sigma$): <span className="font-mono text-cyan-400 font-semibold">{data.volatility}%</span>
          </div>
          <div className="text-slate-300">
            Retorno Esperado ($\mu$): <span className="font-mono text-emerald-400 font-semibold">{data.return}%</span>
          </div>
          <div className="text-slate-300">
            Ratio de Sharpe: <span className="font-mono text-amber-400 font-semibold">{data.sharpe}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
          <XAxis
            type="number"
            dataKey="volatility"
            name="Volatilidad Anual"
            unit="%"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <YAxis
            type="number"
            dataKey="return"
            name="Retorno Esperado Anual"
            unit="%"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

          {/* Curva de la Frontera Eficiente */}
          <Scatter
            name="Frontera Eficiente"
            data={curveData}
            fill="#38bdf8"
            line={{ stroke: "#38bdf8", strokeWidth: 2 }}
            shape="circle"
          />

          {/* Punto de Mínima Varianza */}
          {gmvpPoint.length > 0 && (
            <Scatter
              name="Mínima Varianza (GMVP)"
              data={gmvpPoint}
              fill="#c084fc"
              shape="square"
            />
          )}

          {/* Punto de Máximo Sharpe */}
          {tangencyPoint.length > 0 && (
            <Scatter
              name="Máximo Sharpe (Tangente)"
              data={tangencyPoint}
              fill="#34d399"
              shape="diamond"
            />
          )}

          {/* Punto de Portafolio Actual */}
          {currentPoint.length > 0 && (
            <Scatter
              name="Portafolio Actual"
              data={currentPoint}
              fill="#fb923c"
              shape="cross"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

