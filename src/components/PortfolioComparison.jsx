import HelpTooltip from "./HelpTooltip";
import { HELP } from "../data/help";

const METRIC_HELP = { expected_return: HELP.expectedReturn, volatility: HELP.volatility, sharpe_ratio: HELP.sharpe };

export default function PortfolioComparison({ result }) {
  if (!result.current_portfolio) return null;
  const portfolios = [result.current_portfolio, result.gmvp, result.tangency];
  const tickers = Object.keys(result.gmvp.weights);
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold">
        Tu cartera frente a las alternativas óptimas
      </h3>
      <p className="text-xs text-slate-400">
        Pesos actuales según valor de mercado en USD. Diferencias expresadas en
        puntos porcentuales; no incluyen comisiones ni impuestos. Calculado{" "}
        {new Date(result.valuation_at).toLocaleString("es-AR")}.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead>
            <tr>
              <th className="text-left py-2">Métrica / Activo</th>
              <th>Actual <HelpTooltip label="Pesos de la cartera actual">{HELP.weights}</HelpTooltip></th>
              <th>Mínima varianza</th>
              <th>Máximo Sharpe</th>
              <th>Cambio a máx. Sharpe <HelpTooltip label="Cambio en puntos porcentuales">{HELP.delta}</HelpTooltip></th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Retorno anual estimado", "expected_return", 100, "%"],
              ["Volatilidad anual", "volatility", 100, "%"],
              ["Sharpe", "sharpe_ratio", 1, ""],
            ].map(([label, key, factor, unit]) => (
              <tr key={key} className="border-t border-slate-800">
                <td className="text-left py-2">{label} <HelpTooltip label={label}>{METRIC_HELP[key]}</HelpTooltip></td>
                {portfolios.map((p, i) => (
                  <td key={i}>
                    {(p[key] * factor).toFixed(2)}
                    {unit}
                  </td>
                ))}
                <td>—</td>
              </tr>
            ))}
            {tickers.map((ticker) => {
              const delta =
                (result.tangency.weights[ticker] -
                  (result.current_portfolio.weights[ticker] || 0)) *
                100;
              return (
                <tr key={ticker} className="border-t border-slate-800">
                  <td className="text-left py-2 font-mono">{ticker}</td>
                  {portfolios.map((p, i) => (
                    <td key={i}>
                      {((p.weights[ticker] || 0) * 100).toFixed(1)}%
                    </td>
                  ))}
                  <td
                    className={
                      delta >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(1)} pp
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
