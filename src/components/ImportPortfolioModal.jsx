import React, { useEffect, useRef, useState } from "react";
import { X, Upload, ScanLine, Trash2 } from "lucide-react";
import { analyzeScreenshot, importPositions } from "../api/client";
import { ASSET_CATALOG } from "../data/assets";

const types = { stock: "Acción", cedear: "CEDEAR", crypto: "Criptomoneda", bond: "Bono" };
const inputStyle = "w-full min-w-24 bg-slate-950 border rounded-lg px-2 py-2 text-sm text-white";
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error("No se pudo abrir la imagen."));
  reader.readAsDataURL(file);
});

export default function ImportPortfolioModal({ positions, onClose, onImported }) {
  const [image, setImage] = useState(null);
  const [rows, setRows] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [pending, setPending] = useState(null);
  const [done, setDone] = useState(false);
  const dialog = useRef(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);

  const selectImage = async (event) => {
    const file = event.target.files?.[0];
    setImage(null); setRows(null); setError(""); setReviewed(false); setWarnings([]);
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Elegí una captura PNG, JPG o WebP."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La captura debe pesar como máximo 5 MB."); return;
    }
    setBusy(true);
    try { setImage({ url: await readFile(file), name: file.name, type: file.type }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const analyze = async () => {
    if (!image || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const draft = await analyzeScreenshot(image.type, image.url.split(",")[1]);
      setWarnings(draft.warnings || []);
      setRows(draft.positions.map((row) => Object.fromEntries(
        Object.entries({ ...row, buy_fx_rate: row.buy_fx_rate ?? "" }).map(([key, value]) => [key, value ?? ""]),
      )));
      setReviewed(false);
    } catch (err) { setError(err.message); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const update = (index, field, value) => {
    setRows((current) => current.map((row, i) => i === index ? { ...row, [field]: value } : row));
    setReviewed(false);
  };
  const missing = (row) => !/^[A-Z0-9.^=-]{1,30}$/.test(row.ticker) || !types[row.asset_type]
    || !["ARS", "USD"].includes(row.currency)
    || !Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0
    || !Number.isFinite(Number(row.buy_price)) || Number(row.buy_price) <= 0
    || !/^\d{4}-\d{2}-\d{2}$/.test(row.buy_date) || row.buy_date > today()
    || (row.currency === "ARS" && row.buy_fx_rate !== "" && (!Number.isFinite(Number(row.buy_fx_rate)) || Number(row.buy_fx_rate) <= 0));
  const duplicates = rows?.filter((row, i) => row.ticker && (
    positions.some((p) => p.ticker === row.ticker) || rows.some((other, j) => j !== i && other.ticker === row.ticker)
  ));
  const submit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    const batch = pending || { id: crypto.randomUUID(), positions: rows.map((row) => ({
      ticker: row.ticker, asset_type: row.asset_type, currency: row.currency,
      quantity: Number(row.quantity), buy_price: Number(row.buy_price), buy_date: row.buy_date,
      buy_fx_rate: row.currency === "ARS" && row.buy_fx_rate !== "" ? Number(row.buy_fx_rate) : null,
    })) };
    inFlight.current = true; setBusy(true); setError("");
    try {
      await importPositions(batch.id, batch.positions);
      setDone(true); setPending(null);
      await onImported();
    } catch (err) {
      // Freeze the exact payload only when the outcome is uncertain (network/5xx).
      setPending(err.definitive ? null : batch);
      setError(err.message);
    } finally { inFlight.current = false; setBusy(false); }
  };
  const trapFocus = (event) => {
    if (event.key === "Escape" && !busy) onClose();
    if (event.key !== "Tab") return;
    const elements = [...dialog.current.querySelectorAll("button, input, select, [tabindex='0']")]
      .filter((el) => !el.disabled && !el.closest("fieldset:disabled"));
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) {
      event.preventDefault(); first?.focus();
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
    <section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="import-title"
      onKeyDown={trapFocus} className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7 shadow-2xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id="import-title" className="text-xl font-bold">Importar cartera desde una captura</h2>
        <button aria-label="Cerrar importación" disabled={busy} onClick={onClose} className="p-2 text-slate-400"><X size={22} /></button>
      </div>
      {done ? <div role="status" className="space-y-4">
        <p className="text-emerald-300">¡Cartera importada! Las posiciones ya están guardadas.</p>
        <button onClick={onClose} className="rounded-lg bg-emerald-600 px-5 py-3">Ver mi cartera</button>
      </div> : <>
        <p className="text-sm text-slate-300 mb-4">1. Subí una captura · 2. Revisá y completá · 3. Importá tu cartera</p>
        <p className="text-xs text-slate-400 mb-4">Para probar con datos ficticios: <a href="/examples/cartera-completa.png" download className="text-cyan-300 underline">descargar captura completa</a> o <a href="/examples/cartera-incompleta.png" download className="text-cyan-300 underline">con datos faltantes</a>.</p>
        <fieldset disabled={busy || !!pending} className="space-y-4 min-w-0">
          <label className="block rounded-xl border border-dashed border-slate-600 bg-slate-800/60 p-4">
            <span className="flex items-center gap-2 font-semibold"><Upload size={18} /> Seleccionar captura</span>
            <span className="block text-xs text-slate-400 my-2">PNG, JPG o WebP · Máximo 5 MB. Mostrá los encabezados y las filas completas.</span>
            <input aria-label="Seleccionar captura" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} className="block w-full text-sm" />
          </label>
          <p className="text-xs text-slate-400">Al analizar, la imagen se envía a Google Gemini. Recortá nombres, números de cuenta y otros datos personales. Esta aplicación no guarda la captura. En el nivel gratuito, Google puede usar el contenido para mejorar sus productos.</p>
          {image && <div className="flex flex-col sm:flex-row items-start gap-4">
            <img src={image.url} alt="Captura de la cartera a importar" className="max-h-60 max-w-full sm:max-w-sm rounded-lg border border-slate-700 object-contain" />
            <div><p className="text-sm break-all mb-3">{image.name}</p>
              <button type="button" onClick={analyze} className="inline-flex gap-2 rounded-lg bg-cyan-700 px-4 py-3 font-semibold"><ScanLine size={18} />{rows ? "Volver a analizar" : "Analizar captura"}</button>
            </div>
          </div>}
        </fieldset>
        {warnings.length > 0 && <ul className="my-4 list-disc pl-5 text-sm text-amber-300">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>}
        {rows && rows.length === 0 && <p role="status" className="my-4 text-amber-300">No se detectaron posiciones. Probá una captura más clara que muestre activos y cantidades.</p>}
        {rows?.length > 0 && <form onSubmit={submit} className="mt-6 space-y-4">
          <p className="text-sm text-slate-300">Revisá todos los valores. Los campos vacíos se resaltan: completalos para continuar. El ticker debe corresponder a Yahoo Finance (ej.: GGAL.BA, AAPL, BTC-USD).</p>
          <p className="text-xs text-slate-400">Diferenciá acciones de EE. UU. y CEDEARs. Precio de compra por unidad; en bonos, por 100 VN. Si hay varias compras, cargá cada lote con su fecha y precio. El MEP es opcional: si falta, se busca según la fecha.</p>
          {!!duplicates?.length && <p role="alert" className="rounded-lg bg-amber-950/50 p-3 text-amber-200 text-sm">Activos repetidos: {[...new Set(duplicates.map((r) => r.ticker))].join(", ")}. Se agregarán como nuevas posiciones; revisá que no estés importando la misma tenencia dos veces.</p>}
          <fieldset disabled={busy || !!pending} className="min-w-0 space-y-3">
            {rows.map((row, i) => <article key={i} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
              <div className="flex justify-between gap-3 items-center">
                <h3 className="font-semibold">{i + 1}. {row.name || row.ticker || "Activo sin identificar"}</h3>
                <button type="button" aria-label={`Quitar fila ${i + 1}`} onClick={() => { setRows(rows.filter((_, j) => i !== j)); setReviewed(false); }} className="p-2 text-rose-300"><Trash2 size={17} /></button>
              </div>
              {row.notes && <p className="text-sm text-amber-200">{row.notes}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="text-xs text-slate-300">Ticker
                  <input aria-label={`Ticker fila ${i + 1}`} list="import-tickers" required pattern="[A-Z0-9.\^=\-]{1,30}" value={row.ticker} onChange={(e) => update(i, "ticker", e.target.value.toUpperCase().trim())} placeholder="Completar" className={`${inputStyle} ${row.ticker ? "border-slate-600" : "border-amber-500"}`} />
                </label>
                <label className="text-xs text-slate-300">Tipo de activo
                  <select aria-label={`Tipo fila ${i + 1}`} required value={row.asset_type} onChange={(e) => update(i, "asset_type", e.target.value)} className={`${inputStyle} ${row.asset_type ? "border-slate-600" : "border-amber-500"}`}>
                    <option value="">Seleccionar</option>{Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-300">Moneda del precio
                  <select aria-label={`Moneda fila ${i + 1}`} required value={row.currency} onChange={(e) => update(i, "currency", e.target.value)} className={`${inputStyle} ${row.currency ? "border-slate-600" : "border-amber-500"}`}>
                    <option value="">Seleccionar</option><option value="ARS">ARS</option><option value="USD">USD</option>
                  </select>
                </label>
                {[["quantity", row.asset_type === "bond" ? "Valor nominal" : "Cantidad"], ["buy_price", row.asset_type === "bond" ? "Precio de compra por 100 VN" : "Precio de compra"]].map(([field, label]) =>
                  <label key={field} className="text-xs text-slate-300">{label}
                    <input aria-label={`${label} fila ${i + 1}`} required type="number" step="any" min="0" value={row[field]} onChange={(e) => update(i, field, e.target.value)} placeholder="Completar" className={`${inputStyle} ${Number(row[field]) > 0 ? "border-slate-600" : "border-amber-500"}`} />
                  </label>)}
                <label className="text-xs text-slate-300">Fecha de compra
                  <input aria-label={`Fecha de compra fila ${i + 1}`} required type="date" max={today()} value={row.buy_date} onChange={(e) => update(i, "buy_date", e.target.value)} className={`${inputStyle} ${row.buy_date ? "border-slate-600" : "border-amber-500"}`} />
                </label>
                {row.currency === "ARS" && <label className="text-xs text-slate-300">MEP de compra (opcional)
                  <input aria-label={`MEP fila ${i + 1}`} type="number" step="any" min="0" value={row.buy_fx_rate} onChange={(e) => update(i, "buy_fx_rate", e.target.value)} placeholder="Automático según fecha" className={`${inputStyle} border-slate-600`} />
                </label>}
              </div>
            </article>)}
            <datalist id="import-tickers">{ASSET_CATALOG.map((a) => <option key={a.ticker} value={a.ticker}>{a.name}</option>)}</datalist>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="mt-1" />Revisé los activos, las cantidades, las monedas y los datos de compra. Quiero agregarlos a mi cartera.</label>
          </fieldset>
          {pending && <p role="alert" className="text-amber-200 text-sm">No se pudo confirmar el resultado del guardado. Reintentá esta misma importación: no se duplicará. Los datos quedan bloqueados hasta resolver el reintento.</p>}
          <button type="submit" disabled={busy || (!pending && (!reviewed || rows.some(missing)))} className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold disabled:opacity-40">{busy ? "Importando…" : pending ? "Reintentar importación" : `Importar ${rows.length} posiciones`}</button>
        </form>}
        {busy && <p role="status" className="mt-4 text-cyan-300">{rows?.length ? "Procesando…" : "Leyendo captura… Esto puede tardar unos segundos."}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-950/50 p-3 text-rose-200">{error}</p>}
      </>}
    </section>
  </div>;
}
