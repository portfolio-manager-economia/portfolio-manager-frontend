import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchAssets, fetchAssetDetails } from "../api/client";
import AssetLogo from "./AssetLogo";

const typeLabel = { stock: "Acción", cedear: "CEDEAR", crypto: "Cripto", bond: "Bono" };

export default function AssetSearch({ disabled, onSelect, onResolving }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [choosing, setChoosing] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const selection = useRef(null);
  const list = useRef(null);
  useEffect(() => () => selection.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]); setLoading(false); setSearched(false); return;
      }
      setLoading(true); setError(""); setSearched(false);
      try {
        const data = await searchAssets(query.trim(), controller.signal);
        if (!controller.signal.aborted) { setResults(data); setSearched(true); }
      } catch (err) {
        if (!controller.signal.aborted) { setResults([]); setError(err.message); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  const choose = async (asset) => {
    if (choosing || disabled) return;
    const controller = new AbortController();
    selection.current = controller;
    setChoosing(asset.ticker); onResolving(true); setError("");
    try {
      const details = await fetchAssetDetails(asset.ticker, controller.signal);
      if (!controller.signal.aborted) {
        onSelect({ ...asset, ...details });
        setDismissed(true);
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(`No se pudo verificar ${asset.ticker}: ${err.message}`);
    } finally {
      if (!controller.signal.aborted) { setChoosing(""); onResolving(false); }
    }
  };
  return <div className="space-y-2">
    <label htmlFor="asset-search" className="block text-sm font-medium text-slate-300">Buscar por nombre o ticker</label>
    <div className="relative">
      <Search size={17} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" />
      <input id="asset-search" type="search" value={query} maxLength={80}
        disabled={disabled || !!choosing} autoComplete="off" placeholder="Ej.: Apple, Nvidia, VTI, Bitcoin…"
        onChange={(e) => { setQuery(e.target.value); setResults([]); setSearched(false); setDismissed(false); setError(""); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); list.current?.querySelector("button")?.focus(); }
          if (e.key === "ArrowDown") { e.preventDefault(); list.current?.querySelector("button")?.focus(); }
          if (e.key === "Escape") setDismissed(true);
        }}
        aria-describedby="asset-search-help" className="w-full rounded-lg border border-slate-600 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white focus:border-emerald-500" />
    </div>
    <p id="asset-search-help" className="text-xs text-slate-400">Sugerencias de Yahoo Finance. Elegí el mercado correcto; se admiten activos en ARS y USD.</p>
    {loading && <p role="status" className="text-xs text-cyan-300">Buscando activos…</p>}
    {choosing && <p role="status" className="text-xs text-cyan-300">Verificando moneda y cotización de {choosing}…</p>}
    {error && <p role="alert" className="text-xs text-amber-300">{error}</p>}
    {!dismissed && results.length > 0 && <ul ref={list} aria-label="Resultados de búsqueda" className="max-h-64 overflow-y-auto rounded-xl border border-slate-700 divide-y divide-slate-700 bg-slate-950">
      {results.map((asset) => <li key={asset.ticker}>
        <button type="button" disabled={disabled || !!choosing} onClick={() => choose(asset)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-800 focus:bg-slate-800 disabled:opacity-50">
          <AssetLogo ticker={asset.ticker} url={asset.logo_url} />
          <span className="min-w-0"><span className="block text-sm font-bold text-white">{asset.ticker} <span className="font-normal text-slate-400">· {asset.instrument || typeLabel[asset.asset_type] || "Confirmar tipo"}</span></span>
            <span className="block text-xs text-slate-300 truncate">{asset.name}</span>
            <span className="block text-xs text-slate-400">{asset.exchange} · {asset.currency}</span>
          </span>
        </button>
      </li>)}
    </ul>}
    {!dismissed && searched && !results.length && <p role="status" className="text-sm text-amber-200">Sin resultados compatibles. Probá otro nombre o símbolo, usá el catálogo o ingresá el ticker manualmente como última opción.</p>}
  </div>;
}
