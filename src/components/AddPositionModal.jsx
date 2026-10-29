import React, { useState } from "react";
import { X } from "lucide-react";
import { ASSET_CATALOG } from "../data/assets";

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

  if (!isOpen) return null;

  const handleSelectAsset = (e) => {
    const val = e.target.value;
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
            disabled={saving}
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            {/* Selector de Activos del Catálogo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Seleccionar Activo
              </label>
              <select
                value={isCustom ? "CUSTOM" : selectedAsset}
                onChange={handleSelectAsset}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-emerald-500"
              >
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
                  ✏️ Otro activo (ingresar ticker manual...)
                </option>
              </select>
            </div>

            {/* Si eligió ingresar manualmente */}
            {isCustom && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Ticker Oficial (Yahoo Finance)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: NVDA, YPFD.BA, ETH-USD"
                    value={customTicker}
                    onChange={(e) => setCustomTicker(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Tipo de Activo
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  {assetType === "bond"
                    ? "Valor nominal (bonos)"
                    : "Cantidad de títulos"}
                </label>
                <input
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Precio de compra ({currency}){" "}
                  {assetType === "bond" ? "por 100 VN" : "por unidad"}
                </label>
                <input
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
              <label className="block text-xs text-slate-300 mb-1">
                Moneda de cotización y compra
              </label>
              <select
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
              <label className="block text-xs text-slate-300">
                MEP de compra (ARS por USD, opcional)
                <input
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
              </label>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Fecha de Adquisición
              </label>
              <input
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
