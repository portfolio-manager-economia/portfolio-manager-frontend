import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { ASSET_CATALOG } from "../data/assets";

export default function AddPositionModal({ isOpen, onClose, onAdd }) {
  const [selectedAsset, setSelectedAsset] = useState(ASSET_CATALOG[0].ticker);
  const [isCustom, setIsCustom] = useState(false);
  const [customTicker, setCustomTicker] = useState("");
  const [assetType, setAssetType] = useState(ASSET_CATALOG[0].type);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);

  if (!isOpen) return null;

  const handleSelectAsset = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM") {
      setIsCustom(true);
      setCustomTicker("");
    } else {
      setIsCustom(false);
      setSelectedAsset(val);
      const found = ASSET_CATALOG.find((a) => a.ticker === val);
      if (found) {
        setAssetType(found.type);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTicker = isCustom ? customTicker.trim().toUpperCase() : selectedAsset;
    if (!finalTicker || !quantity || !buyPrice) return;

    onAdd({
      ticker: finalTicker,
      asset_type: assetType,
      quantity: parseFloat(quantity),
      buy_price: parseFloat(buyPrice),
      buy_date: buyDate,
    });

    setQuantity("");
    setBuyPrice("");
    setIsCustom(false);
    onClose();
  };

  // Agrupar catálogo por categorías
  const categories = Array.from(new Set(ASSET_CATALOG.map((a) => a.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white">Nueva Posición</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <optgroup key={cat} label={`── ${cat} ──`} className="bg-slate-900 text-emerald-400 font-bold">
                  {ASSET_CATALOG.filter((a) => a.category === cat).map((asset) => (
                    <option key={asset.ticker} value={asset.ticker} className="bg-slate-800 text-white font-normal">
                      {asset.name} ({asset.ticker})
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="CUSTOM" className="bg-slate-900 text-amber-300 font-semibold">
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
                Cantidad de Títulos
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
                Precio de Compra ($)
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
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Fecha de Adquisición
            </label>
            <input
              type="date"
              value={buyDate}
              onChange={(e) => setBuyDate(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

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
              Guardar Posición
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
