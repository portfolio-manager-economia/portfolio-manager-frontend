import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImportPortfolioModal from "./ImportPortfolioModal";
import { analyzeScreenshot, importPositions } from "../api/client";
vi.mock("../api/client", () => ({ analyzeScreenshot: vi.fn(), importPositions: vi.fn() }));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

async function upload(user) {
  await user.upload(screen.getByLabelText("Seleccionar captura"), new File(["image"], "portfolio.png", { type: "image/png" }));
  await user.click(await screen.findByRole("button", { name: "Analizar captura" }));
}

it("requires missing purchase fields and review before saving extracted positions", async () => {
  const user = userEvent.setup();
  const onImported = vi.fn();
  analyzeScreenshot.mockResolvedValue({ positions: [{ name: "Apple", ticker: "AAPL", asset_type: "stock", currency: "USD", quantity: 5 }], warnings: [] });
  importPositions.mockResolvedValue({});
  render(<ImportPortfolioModal positions={[{ ticker: "AAPL" }]} onClose={vi.fn()} onImported={onImported} />);
  await upload(user);
  const submit = await screen.findByRole("button", { name: "Importar 1 posiciones" });
  expect(submit.disabled).toBe(true);
  expect(screen.getByLabelText("Fecha de compra fila 1").value).toBe("");
  expect(screen.getByRole("alert").textContent).toContain("Activos repetidos");
  await user.type(screen.getByLabelText("Precio de compra fila 1"), "150");
  await user.type(screen.getByLabelText("Fecha de compra fila 1"), "2024-01-15");
  expect(submit.disabled).toBe(true);
  await user.click(screen.getByRole("checkbox"));
  await user.click(submit);
  await screen.findByText(/¡Cartera importada!/);
  expect(importPositions.mock.calls[0][1][0]).toEqual({ ticker: "AAPL", asset_type: "stock", currency: "USD", quantity: 5, buy_price: 150, buy_date: "2024-01-15", buy_fx_rate: null });
  expect(onImported).toHaveBeenCalledOnce();
});

it("retries an uncertain save with the same ID and frozen payload", async () => {
  const user = userEvent.setup();
  analyzeScreenshot.mockResolvedValue({ positions: [{ ticker: "AAPL", asset_type: "stock", currency: "USD", quantity: 1, buy_price: 100, buy_date: "2024-01-15" }], warnings: [] });
  importPositions.mockRejectedValueOnce(new Error("Sin conexión")).mockResolvedValueOnce({});
  render(<ImportPortfolioModal positions={[]} onClose={vi.fn()} onImported={vi.fn()} />);
  await upload(user);
  await screen.findByRole("button", { name: "Importar 1 posiciones" });
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Importar 1 posiciones" }));
  await user.click(await screen.findByRole("button", { name: "Reintentar importación" }));
  await screen.findByText(/¡Cartera importada!/);
  expect(importPositions.mock.calls[0]).toEqual(importPositions.mock.calls[1]);
});

it("shows quota errors without saving anything", async () => {
  const user = userEvent.setup();
  analyzeScreenshot.mockRejectedValue(new Error("El servicio alcanzó su cuota"));
  render(<ImportPortfolioModal positions={[]} onClose={vi.fn()} onImported={vi.fn()} />);
  await upload(user);
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("cuota"));
  expect(importPositions).not.toHaveBeenCalled();
});
