import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPositionModal from "./AddPositionModal";
import AssetLogo from "./AssetLogo";
import { searchAssets, fetchAssetDetails } from "../api/client";
vi.mock("../api/client", () => ({ searchAssets: vi.fn(), fetchAssetDetails: vi.fn() }));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

it("selects a provider result outside the catalog and saves its exact ticker and currency", async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockResolvedValue({});
  searchAssets.mockResolvedValue([{ ticker: "VTI", name: "Vanguard Total Stock Market ETF", asset_type: "stock", currency: "USD", instrument: "ETF", exchange: "NYSEArca" }]);
  fetchAssetDetails.mockResolvedValue({ ticker: "VTI", currency: "USD", price: 300, quote_at: "2026-11-03T12:00:00Z" });
  render(<AddPositionModal isOpen onClose={vi.fn()} onAdd={save} />);
  await user.type(screen.getByRole("searchbox"), "VTI");
  await user.click(await screen.findByRole("button", { name: /VTI.*ETF/ }));
  await screen.findByText(/Última cotización: 300 USD/);
  expect(screen.getByRole("spinbutton", { name: /Precio de compra/ }).value).toBe("");
  await user.type(screen.getByRole("spinbutton", { name: /Cantidad de títulos/ }), "2");
  await user.type(screen.getByRole("spinbutton", { name: /Precio de compra/ }), "250");
  await user.click(screen.getByRole("button", { name: "Guardar posición" }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(save.mock.calls[0][0]).toMatchObject({ ticker: "VTI", asset_type: "stock", currency: "USD", buy_price: 250, quantity: 2 });
});

it("ignores stale results and keeps manual entry available when search fails", async () => {
  const user = userEvent.setup();
  let oldResult;
  searchAssets.mockImplementationOnce(() => new Promise((resolve) => { oldResult = resolve; }))
    .mockRejectedValueOnce(new Error("Buscador temporalmente no disponible"));
  render(<AddPositionModal isOpen onClose={vi.fn()} onAdd={vi.fn()} />);
  const input = screen.getByRole("searchbox");
  await user.type(input, "Apple");
  await waitFor(() => expect(searchAssets).toHaveBeenCalledOnce());
  await user.clear(input); await user.type(input, "Nvidia");
  await screen.findByText("Buscador temporalmente no disponible");
  oldResult([{ ticker: "AAPL", name: "Apple", currency: "USD", exchange: "NASDAQ" }]);
  await waitFor(() => expect(screen.queryByRole("button", { name: /AAPL.*Confirmar/ })).toBeNull());
  await user.selectOptions(screen.getAllByRole("combobox")[0], "CUSTOM");
  expect(screen.getByRole("textbox", { name: /Ticker Oficial/ })).toBeTruthy();
});

it("shows a ticker fallback when its remote logo fails", () => {
  const { container } = render(<AssetLogo ticker="AAPL.BA" url="https://provider.invalid/logo.png" />);
  fireEvent.error(container.querySelector("img"));
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByText("AAP")).toBeTruthy();
});
