import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import {
  Briefcase,
  TrendingUp,
  PieChart as PieIcon,
  BookOpen,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
} from "lucide-react";

import DolarTicker from "./components/DolarTicker";
import PositionsTable from "./components/PositionsTable";
import AddPositionModal from "./components/AddPositionModal";
import CompanyLogo from "./components/CompanyLogo";
import ImportPortfolioModal from "./components/ImportPortfolioModal";
const TheoryPage = lazy(() => import("./components/TheoryPage"));
const EfficientFrontierChart = lazy(
  () => import("./components/EfficientFrontierChart"),
);
import OptimalPortfoliosCard from "./components/OptimalPortfoliosCard";
import PortfolioComparison from "./components/PortfolioComparison";
import HelpTooltip, { FieldLabel } from "./components/HelpTooltip";
import { HELP } from "./data/help";
import { ASSET_CATALOG, PRESET_PORTFOLIOS } from "./data/assets";

import {
  fetchPositions,
  createPosition,
  deletePosition,
  optimizePortfolio,
} from "./api/client";

export default function App() {
  const [activeTab, setActiveTab] = useState("portfolio"); // 'portfolio' | 'optimizer' | 'theory'
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Estado del Optimizador
  const [selectedTickers, setSelectedTickers] = useState([
    "AAPL",
    "MSFT",
    "GOOGL",
    "GGAL.BA",
  ]);
  const [riskFreeRate, setRiskFreeRate] = useState("0.04");
  const [period, setPeriod] = useState("1y");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [optError, setOptError] = useState("");
  const [catalogFilter, setCatalogFilter] = useState("TODOS");
  const [positionsError, setPositionsError] = useState("");
  const [positionsUpdatedAt, setPositionsUpdatedAt] = useState(null);
  const loadingRef = useRef(false);
  const optimizationRef = useRef(false);
  const [compareCurrent, setCompareCurrent] = useState(false);

  const loadPositions = useCallback(async (refresh = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoadingPositions(true);
    try {
      const data = await fetchPositions(refresh);
      setPositions(data);
      setPositionsError("");
      setPositionsUpdatedAt(new Date());
    } catch (err) {
      setPositionsError(err.message);
    } finally {
      setLoadingPositions(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => loadPositions(), 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadPositions();
    }, 60000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [loadPositions]);

  const handleAddPosition = async (newPos) => {
    try {
      await createPosition(newPos);
      setOptimizationResult(null);
      await loadPositions();
    } catch (err) {
      throw new Error("Error al agregar la posición: " + err.message);
    }
  };

  const handleDeletePosition = async (id) => {
    if (!window.confirm("¿Seguro que deseás eliminar este activo?")) return;
    try {
      await deletePosition(id);
      setOptimizationResult(null);
      await loadPositions();
    } catch (err) {
      alert("Error al eliminar la posición: " + err.message);
    }
  };

  const toggleTicker = (ticker) => {
    setOptimizationResult(null);
    if (selectedTickers.includes(ticker)) {
      setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
    } else {
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  const handleApplyPreset = (tickers) => {
    setOptimizationResult(null);
    setCompareCurrent(false);
    setSelectedTickers(tickers);
  };

  const handleLoadMyPortfolio = () => {
    if (portfolioTickers.length < 2) {
      alert("Tenés menos de 2 activos registrados en tu cartera.");
      return;
    }
    const myTickers = Array.from(new Set(positions.map((p) => p.ticker)));
    setSelectedTickers(myTickers);
    setCompareCurrent(true);
    setOptimizationResult(null);
  };

  const handleRunOptimization = async (
    customList = null,
    compare = compareCurrent,
  ) => {
    if (optimizationRef.current) return;
    const listToRun = customList || selectedTickers;
    setActiveTab("optimizer");
    if (listToRun.length < 2) {
      setOptError(
        "Por favor seleccioná al menos 2 activos distintos para calcular la frontera eficiente.",
      );
      return;
    }

    setOptError("");
    setOptimizationResult(null);
    setActiveTab("optimizer");
    optimizationRef.current = true;
    setOptimizing(true);
    try {
      const rf = Number(riskFreeRate);
      if (riskFreeRate === "" || !Number.isFinite(rf) || rf < 0 || rf > 1)
        throw new Error("Ingresá una tasa entre 0 y 1.");
      const res = await optimizePortfolio(listToRun, rf, period, compare);
      setOptimizationResult(res);
      setActiveTab("optimizer");
    } catch (err) {
      setOptError(
        err.message || "Error al procesar la optimización de Markowitz.",
      );
    } finally {
      setOptimizing(false);
      optimizationRef.current = false;
    }
  };

  const portfolioTickers = Array.from(new Set(positions.map((p) => p.ticker)));

  // Filtrado del catálogo
  const categories = [
    "TODOS",
    ...Array.from(new Set(ASSET_CATALOG.map((a) => a.category))),
  ];
  const filteredCatalog =
    catalogFilter === "TODOS"
      ? ASSET_CATALOG
      : ASSET_CATALOG.filter((a) => a.category === catalogFilter);

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Ticker de cotizaciones de Argentina */}
      <DolarTicker />

      {/* Header y Navegación Principal */}
      <header className="app-header border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-40">
        <div className="app-header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="brand-lockup flex items-center gap-3">
            <div className="brand-mark w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h1 className="brand-title text-xl font-bold tracking-tight text-white m-0">
                Portfolio Manager
              </h1>
              <p className="brand-subtitle text-xs text-slate-400 m-0">
                Modelo Cuantitativo de Markowitz • Finanzas y Economía
              </p>
            </div>
          </div>

          {/* Selector de Pestañas */}
          <nav className="app-navigation flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`app-tab flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "portfolio"
                  ? "app-tab-active bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Briefcase size={15} />
              Mi Portafolio
            </button>
            <button
              onClick={() => setActiveTab("optimizer")}
              className={`app-tab flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "optimizer"
                  ? "app-tab-active bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <PieIcon size={15} />
              Frontera Eficiente
            </button>
            <button
              onClick={() => setActiveTab("theory")}
              className={`app-tab flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "theory"
                  ? "app-tab-active bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen size={15} />
              Teoría & Fórmulas
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="main-container flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PESTAÑA 1: MI PORTAFOLIO */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="portfolio-intro flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="portfolio-intro-copy">
                <h2 className="page-title text-2xl font-bold text-white tracking-tight">
                  Seguimiento de Cartera
                </h2>
                <p className="text-sm text-slate-400">
                  Valuación en USD al dólar MEP y rentabilidad acumulada.
                  Actualización automática cada 60 segundos; los precios pueden
                  tener demora del proveedor.
                </p>
              </div>
              <div className="portfolio-actions flex gap-2">
                <button
                  onClick={() => loadPositions(true)}
                  disabled={loadingPositions}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw
                    size={14}
                    className={loadingPositions ? "animate-spin" : ""}
                  />
                  Actualizar Cotizaciones
                </button>
                {portfolioTickers.length >= 2 && (
                  <button
                    onClick={() => {
                      const myTickers = Array.from(
                        new Set(positions.map((p) => p.ticker)),
                      );
                      setSelectedTickers(myTickers);
                      setCompareCurrent(true);
                      handleRunOptimization(myTickers, true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Sliders size={14} />
                    Optimizar Mi Cartera Actual
                  </button>
                )}
              </div>
            </div>

            {positionsError && (
              <p role="alert" className="text-rose-300">
                {positionsError}. Los datos visibles pueden estar
                desactualizados.
              </p>
            )}
            {positionsUpdatedAt && (
              <p className="text-xs text-slate-400">
                Última consulta:{" "}
                {positionsUpdatedAt.toLocaleTimeString("es-AR")}. Cada posición
                indica la fecha de su cotización.
              </p>
            )}
            <PositionsTable
              positions={positions}
              onDelete={handleDeletePosition}
              onOpenModal={() => setIsModalOpen(true)}
              onImport={() => setIsImportOpen(true)}
            />
          </div>
        )}

        {/* PESTAÑA 2: OPTIMIZACIÓN MARKOWITZ */}
        {activeTab === "optimizer" && (
          <div className="optimizer-page space-y-8">
            {/* Panel de Configuración de la Optimización */}
            <fieldset
              disabled={optimizing}
              className="optimizer-config min-w-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
            >
              <div className="optimizer-heading flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="text-emerald-400" size={20} />
                    Selección de Activos para la Frontera Eficiente
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Elegí activos del catálogo. La disponibilidad de cada
                    cotización depende del proveedor.
                  </p>
                </div>

                {portfolioTickers.length >= 2 && (
                  <button
                    onClick={handleLoadMyPortfolio}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all"
                  >
                    📥 Cargar activos de mi portafolio ({positions.length})
                  </button>
                )}
              </div>

              {/* Presets rápidos */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles size={14} className="text-amber-400" />
                  Carteras Sugeridas (1 Click):
                  <HelpTooltip label="Carteras sugeridas">{HELP.presets}</HelpTooltip>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PORTFOLIOS.map((p) => (
                    <button
                      key={p.name}
                      disabled={optimizing}
                      onClick={() => handleApplyPreset(p.tickers)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activos Seleccionados Actualmente */}
              <div className="selected-assets-panel p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Activos Seleccionados ({selectedTickers.length}):
                    <HelpTooltip label="Activos seleccionados">{HELP.selected}</HelpTooltip>
                  </div>
                  {selectedTickers.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedTickers([]);
                        setOptimizationResult(null);
                      }}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Limpiar selección
                    </button>
                  )}
                </div>

                {selectedTickers.length === 0 ? (
                  <p className="text-xs text-amber-400 font-medium py-2">
                    ⚠️ No hay activos seleccionados. Hacé clic en los botones de
                    abajo para sumar al menos 2.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedTickers.map((ticker) => {
                      const found = ASSET_CATALOG.find(
                        (a) => a.ticker === ticker,
                      );
                      return (
                        <span
                          key={ticker}
                          className="selected-asset-chip inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm"
                        >
                          <CompanyLogo company={ticker} size={32} />
                          {ticker}
                          {found && (
                            <span className="font-sans font-normal text-slate-400 text-[10px]">
                              ({found.name.split(" ")[0]})
                            </span>
                          )}
                          <button
                            onClick={() => toggleTicker(ticker)}
                            className="text-slate-400 hover:text-rose-400 ml-1"
                            title="Quitar activo"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Catálogo de Activos para Clickear */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Catálogo de Activos Disponibles (hacé clic para
                    sumar/quitar):
                    <HelpTooltip label="Catálogo de activos">{HELP.catalog}</HelpTooltip>
                  </div>

                  {/* Filtro por categoría */}
                  <div className="flex flex-wrap gap-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCatalogFilter(cat)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          catalogFilter === cat
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="catalog-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                  {filteredCatalog.map((asset) => {
                    const isSelected = selectedTickers.includes(asset.ticker);
                    return (
                      <button
                        key={asset.ticker}
                        onClick={() => toggleTicker(asset.ticker)}
                        className={`catalog-asset text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between ${
                          isSelected
                            ? "catalog-asset-selected bg-emerald-600/20 border-emerald-500 text-white font-semibold shadow-sm"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="catalog-asset-main flex items-center gap-2 min-w-0">
                          <CompanyLogo company={asset.ticker} size={32} />
                          <div className="catalog-asset-copy truncate pr-1">
                            <div className="font-mono font-bold text-xs">
                              {asset.ticker}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {asset.name}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400 shrink-0 mt-0.5"
                          />
                        ) : (
                          <PlusCircle
                            size={16}
                            className="text-slate-500 hover:text-slate-300 shrink-0 mt-0.5"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Parámetros Técnicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <FieldLabel htmlFor="optimizer-risk-free" help={HELP.riskFree}>
                    Tasa Libre de Riesgo (r_f)
                  </FieldLabel>
                  <input
                    id="optimizer-risk-free"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={riskFreeRate}
                    onChange={(e) => {
                      setRiskFreeRate(e.target.value);
                      setOptimizationResult(null);
                    }}
                    placeholder="0.04"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-500">
                    Tasa anual en USD. 0.04 = 4%; es un valor editable de
                    ejemplo, no una cotización vigente.
                  </span>
                </div>

                <div>
                  <FieldLabel htmlFor="optimizer-period" help={HELP.period}>
                    Ventana Histórica de Precios
                  </FieldLabel>
                  <select
                    id="optimizer-period"
                    value={period}
                    onChange={(e) => {
                      setPeriod(e.target.value);
                      setOptimizationResult(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="6mo">6 Meses</option>
                    <option value="1y">1 Año (Recomendado)</option>
                    <option value="2y">2 Años</option>
                    <option value="5y">5 Años</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 items-center text-sm text-slate-300"><label htmlFor="optimizer-compare" className="flex gap-2 items-center">
                <input
                  id="optimizer-compare"
                  type="checkbox"
                  checked={compareCurrent}
                  disabled={!positions.length || optimizing}
                  onChange={(e) => {
                    setCompareCurrent(e.target.checked);
                    setOptimizationResult(null);
                  }}
                />
                Comparar con mi cartera actual (incluí todos sus activos)
              </label>
              <HelpTooltip label="Comparar con mi cartera actual">{HELP.compare}</HelpTooltip></div>
              {optError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  {optError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleRunOptimization()}
                  disabled={optimizing || selectedTickers.length < 2}
                  className={`px-6 py-3 font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                    optimizing || selectedTickers.length < 2
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95"
                  }`}
                >
                  {optimizing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Consultando cotizaciones y optimizando...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={16} />
                      Calcular Portafolios Óptimos ({
                        selectedTickers.length
                      }{" "}
                      Activos)
                    </>
                  )}
                </button>
              </div>
            </fieldset>

            {/* Resultados y Gráficos */}
            {optimizationResult && (
              <div className="optimization-results space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xs text-slate-400">
                  Resultados en USD · {optimizationResult.start_date} a{" "}
                  {optimizationResult.end_date} ·{" "}
                  {optimizationResult.observations} retornos ·{" "}
                  {optimizationResult.annualization_factor} períodos/año ·{" "}
                  {optimizationResult.fx_method}. Estimaciones históricas; no
                  garantizan retornos futuros.
                </p>
                {/* Gráfico de Frontera Eficiente */}
                <div className="frontier-chart-card bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        Curva de la Frontera Eficiente de Markowitz
                      </h4>
                      <p className="text-xs text-slate-400">
                        Cada punto representa una combinación de activos que
                        maximiza el retorno para ese nivel exacto de
                        volatilidad.
                      </p>
                    </div>
                  </div>
                  <Suspense
                    fallback={
                      <p className="text-slate-400">Cargando gráfico…</p>
                    }
                  >
                    <EfficientFrontierChart
                      frontierData={optimizationResult.frontier}
                      gmvp={optimizationResult.gmvp}
                      tangency={optimizationResult.tangency}
                      currentPortfolio={optimizationResult.current_portfolio}
                    />
                  </Suspense>
                </div>

                {/* Tarjetas de Detalle de Portafolios Óptimos */}
                <OptimalPortfoliosCard
                  gmvp={optimizationResult.gmvp}
                  tangency={optimizationResult.tangency}
                />
                <PortfolioComparison result={optimizationResult} />
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: TEORÍA & FORMULACIÓN MATEMÁTICA */}
        {activeTab === "theory" && (
          <Suspense fallback={<p className="text-slate-400">Cargando fórmulas…</p>}>
            <TheoryPage />
          </Suspense>
        )}
      </main>

      {/* Modal para agregar posición */}
      {isImportOpen && <ImportPortfolioModal positions={positions} onClose={() => setIsImportOpen(false)} onImported={async () => {
        setOptimizationResult(null);
        await loadPositions();
      }} />}
      {isModalOpen && (
        <AddPositionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddPosition}
        />
      )}
    </div>
  );
}
