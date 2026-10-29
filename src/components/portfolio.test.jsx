import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PositionsTable from "./PositionsTable";
import AddPositionModal from "./AddPositionModal";
import PortfolioComparison from "./PortfolioComparison";

afterEach(cleanup);

describe("USD portfolio presentation", () => {
  it("does not present partial totals or an unavailable price as zero profit", () => {
    render(
      <PositionsTable
        positions={[
          {
            id: "one",
            ticker: "AAPL",
            asset_type: "stock",
            currency: "USD",
            quantity: 1,
            buy_price: 100,
            cost_basis_usd: 100,
            market_value: null,
            current_price: null,
            unrealized_pnl: null,
            unrealized_pnl_pct: null,
            quote_error: "Sin precio",
          },
        ]}
        onDelete={vi.fn()}
        onOpenModal={vi.fn()}
      />,
    );
    expect(screen.getAllByText("No disponible")).toHaveLength(2);
    expect(screen.getByText("Sin precio")).toBeTruthy();
    expect(screen.queryByText("0.00%")).toBeNull();
  });

  it("preserves the form and explains errors when saving fails", async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const save = vi.fn().mockRejectedValue(new Error("No se pudo guardar"));
    render(<AddPositionModal isOpen onClose={close} onAdd={save} />);
    await user.selectOptions(screen.getAllByRole("combobox")[0], "AAPL");
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "2");
    await user.type(inputs[1], "100");
    await user.click(screen.getByRole("button", { name: "Guardar posición" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        ticker: "AAPL",
        currency: "USD",
        quantity: 2,
        buy_price: 100,
        buy_fx_rate: null,
      }),
    );
    expect(screen.getByRole("alert").textContent).toBe("No se pudo guardar");
    expect(close).not.toHaveBeenCalled();
    expect(inputs[0].value).toBe("2");
  });

  it("shows actual market weights and the change to the optimal weights", () => {
    const point = (weights) => ({
      expected_return: 0.1,
      volatility: 0.2,
      sharpe_ratio: 0.3,
      weights,
    });
    render(
      <PortfolioComparison
        result={{
          current_portfolio: point({ AAPL: 0.6, MSFT: 0.4 }),
          gmvp: point({ AAPL: 0.5, MSFT: 0.5 }),
          tangency: point({ AAPL: 0.8, MSFT: 0.2 }),
          valuation_at: "2026-10-28T12:00:00Z",
        }}
      />,
    );
    expect(screen.getByText("60.0%")).toBeTruthy();
    expect(screen.getByText("+20.0 pp")).toBeTruthy();
    expect(screen.getByText("-20.0 pp")).toBeTruthy();
  });
});
