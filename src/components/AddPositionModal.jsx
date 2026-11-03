import React, { useState } from "react";
import { X } from "lucide-react";
import { ASSET_CATALOG } from "../data/assets";
import { FieldLabel } from "./HelpTooltip";
import { HELP } from "../data/help";
import AssetSearch from "./AssetSearch";
import AssetLogo from "./AssetLogo";

export default function AddPositionModal({ isOpen, onClose, onAdd }) {
  const [selectedAsset, setSelectedAsset] = useState(ASSET_CATALOG[0].ticker);
  const [isCustom, setIsCustom] = useState(false);
  const [customTicker, setCustomTicker] = useState("");
  const [assetType, setAssetType] = useState(ASSET_CATALOG[0].type);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [today] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [buyDate, setBuyDate] = useState(today);
  const [currency, setCurrency] = useState("ARS");
  const [buyFx, setBuyFx] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [apiAsset, setApiAsset] = useState(null);
  const [resolving, setResolving] = useState(false);

  if (!isOpen) return null;

  const handleSelectAsset = (e) => {
    const val = e.target.value;
    setApiAsset(null);
    if (val === "CUSTOM") {
      setIsCustom(true);
      setCustomTicker("");
    } else {
      setIsCustom(false);
      setSelectedAsset(val);
      setCurrency(
        val.endsWith(".BA") && !["AL30D.BA", "GD30D.BA"].includes(val)
          ? "ARS"
          : "USD",
      );
      setBuyFx("");
      const found = ASSET_CATALOG.find((a) => a.ticker === val);
      if (found) {
        setAssetType(found.type);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resolving || saving) return;
    const finalTicker = isCustom
      ? customTicker.trim().toUpperCase()
      : selectedAsset;
    if (!finalTicker || !quantity || !buyPrice) return;

    setError("");
    setSaving(true);
    try {
      await onAdd({
        ticker: finalTicker,
        asset_type: assetType,
        quantity: parseFloat(quantity),
        buy_price: parseFloat(buyPrice),
        buy_date: buyDate,
        currency,
        buy_fx_rate: currency === "ARS" && buyFx !== "" ? Number(buyFx) : null,
      });

      setQuantity("");
      setBuyPrice("");
      setIsCustom(false);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Agrupar catálogo por categorías
  const categories = Array.from(new Set(ASSET_CATALOG.map((a) => a.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white">Nueva Posición</h3>
          <button
            disabled={saving || resolving}
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            <AssetSearch disabled={saving} onResolving={setResolving} onSelect={(asset) => {
              setApiAsset(asset); setIsCustom(false); setSelectedAsset(asset.ticker);
              setAssetType(asset.asset_type || ASSET_CATALOG.find((a) => a.ticker === asset.ticker)?.type || "");
              setCurrency(asset.currency); setBuyFx(""); setError("");
            }} />
            {apiAsset && <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-3 text-sm">
              <div className="flex items-center gap-3"><AssetLogo ticker={apiAsset.ticker} url={apiAsset.logo_url} /><div><strong>{apiAsset.name}</strong><p className="text-xs text-slate-400">{apiAsset.ticker} · {apiAsset.exchange} · {apiAsset.currency}</p></div></div>
              <p className="mt-2 text-emerald-300">{apiAsset.price != null ? `Última cotización: ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 8 }).format(apiAsset.price)} ${apiAsset.currency}` : "Cotización actual no disponible en este momento."}</p>
              {apiAsset.quote_at && <p className="text-xs text-slate-400">Cotización del {new Date(apiAsset.quote_at).toLocaleString("es-AR")}</p>}
              <p className="mt-1 text-xs text-slate-400">Completá abajo tu precio y fecha de compra.</p>
            </div>}
            {/* Selector de Activos del Catálogo */}
            <div>
              <FieldLabel htmlFor="position-asset" help={HELP.asset}>
                Seleccionar Activo
              </FieldLabel>
              <select
                id="position-asset"
                value={apiAsset ? "API" : isCustom ? "CUSTOM" : selectedAsset}
                disabled={resolving}
                onChange={handleSelectAsset}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-emerald-500"
              >
                {apiAsset && <option value="API">{apiAsset.name} ({apiAsset.ticker}) — seleccionado del buscador</option>}
                {categories.map((cat) => (
                  <optgroup
                    key={cat}
                    label={`── ${cat} ──`}
                    className="bg-slate-900 text-emerald-400 font-bold"
                  >
                    {ASSET_CATALOG.filter((a) => a.category === cat).map(
                      (asset) => (
                        <option
                          key={asset.ticker}
                          value={asset.ticker}
                          className="bg-slate-800 text-white font-normal"
                        >
                          {asset.name} ({asset.ticker})
                        </option>
                      ),
                    )}
                  </optgroup>
                ))}
                <option
                  value="CUSTOM"
                  className="bg-slate-900 text-amber-300 font-semibold"
                >
                  No lo encontré: ingresar ticker manual (última opción)
                </option>
              </select>
            </div>

            {/* Si eligió ingresar manualmente */}
            {(isCustom || (apiAsset && !apiAsset.asset_type)) && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 space-y-3">
                {isCustom && <div>
                  <FieldLabel htmlFor="position-ticker" help={HELP.ticker}>
                    Ticker Oficial (Yahoo Finance)
                  </FieldLabel>
                  <input
                    id="position-ticker"
                    type="text"
                    placeholder="Ej: NVDA, YPFD.BA, ETH-USD"
                    value={customTicker}
                    onChange={(e) => setCustomTicker(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>}

                <div>
                  <FieldLabel htmlFor="position-type" help={HELP.assetType}>
                    Tipo de Activo
                  </FieldLabel>
                  <select
                    id="position-type"
                    required
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Confirmá el tipo de activo</option>
                    <option value="stock">Acción</option>
                    <option value="cedear">CEDEAR</option>
                    <option value="crypto">Criptomoneda</option>
                    <option value="bond">Bono</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="position-quantity" help={assetType === "bond" ? HELP.nominal : HELP.quantity}>
                  {assetType === "bond"
                    ? "Valor nominal (bonos)"
                    : "Cantidad de títulos"}
                </FieldLabel>
                <input
                  id="position-quantity"
                  type="number"
                  step="any"
                  min="0.000001"
                  placeholder="Ej: 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <FieldLabel htmlFor="position-price" help={assetType === "bond" ? HELP.bondPrice : HELP.buyPrice}>
                  {`Precio de compra (${currency}) ${assetType === "bond" ? "por 100 VN" : "por unidad"}`}
                </FieldLabel>
                <input
                  id="position-price"
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="Ej: 150.00"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="position-currency" help={HELP.currency}>
                Moneda de cotización y compra
              </FieldLabel>
              <select
                id="position-currency"
                disabled={!isCustom}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="ARS">ARS — pesos</option>
                <option value="USD">USD — dólares</option>
              </select>
            </div>
            {currency === "ARS" && (
              <div>
                <FieldLabel htmlFor="position-fx" help={HELP.buyFx}>MEP de compra (ARS por USD, opcional)</FieldLabel>
                <input
                  id="position-fx"
                  type="number"
                  min="0.01"
                  step="any"
                  value={buyFx}
                  onChange={(e) => setBuyFx(e.target.value)}
                  className="block w-full bg-slate-900 rounded-lg px-3 py-2 mt-1"
                  placeholder="Automático según la fecha de compra"
                />
                <span className="text-slate-400">
                  Podés ingresar tu tipo de cambio efectivo; si lo dejás vacío
                  se consulta el MEP histórico de ArgentinaDatos.
                </span>
              </div>
            )}
            <div>
              <FieldLabel htmlFor="position-date" help={HELP.buyDate}>
                Fecha de Adquisición
              </FieldLabel>
              <input
                id="position-date"
                type="date"
                max={today}
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-rose-300 text-sm">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={resolving}
                className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg active:scale-95"
              >
                {saving ? "Guardando…" : "Guardar posición"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
