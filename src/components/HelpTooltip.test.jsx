import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpTooltip from "./HelpTooltip";
import AddPositionModal from "./AddPositionModal";

afterEach(cleanup);

it("shows help with keyboard focus, associates the description and dismisses on Escape", async () => {
  const user = userEvent.setup();
  render(<HelpTooltip label="Cantidad">Ingresá unidades, no el total pagado.</HelpTooltip>);
  expect(screen.queryByRole("tooltip")).toBeNull();
  await user.tab();
  const button = screen.getByRole("button", { name: "Ayuda: Cantidad" });
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip").id);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(document.activeElement).toBe(button);
});

it("supports click/tap toggling and outside dismissal without submitting the form", async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<form onSubmit={submit}><HelpTooltip label="Precio">Precio por unidad.</HelpTooltip><input aria-label="Otro campo" /></form>);
  const button = screen.getByRole("button", { name: "Ayuda: Precio" });
  await user.click(button);
  expect(screen.getByRole("tooltip")).toBeTruthy();
  await user.click(button);
  expect(screen.queryByRole("tooltip")).toBeNull();
  await user.click(button);
  await user.click(screen.getByLabelText("Otro campo"));
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(submit).not.toHaveBeenCalled();
});

it("shows help on hover and lets the pointer move onto the explanation", async () => {
  const user = userEvent.setup();
  render(<HelpTooltip label="MEP">Pesos por dólar.</HelpTooltip>);
  const button = screen.getByRole("button");
  await user.hover(button);
  const tooltip = screen.getByRole("tooltip");
  await user.unhover(button);
  await user.hover(tooltip);
  expect(screen.getByRole("tooltip")).toBeTruthy();
  await user.unhover(tooltip);
  await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
});

it("gives every new-position field help and switches to nominal-value explanations for bonds", async () => {
  const user = userEvent.setup();
  render(<AddPositionModal isOpen onClose={vi.fn()} onAdd={vi.fn()} />);
  for (const name of ["Seleccionar Activo", "Cantidad de títulos", "Precio de compra (ARS) por unidad", "Moneda de cotización y compra", "MEP de compra (ARS por USD, opcional)", "Fecha de Adquisición"]) {
    expect(screen.getByRole("button", { name: `Ayuda: ${name}` })).toBeTruthy();
    expect(screen.getByLabelText(name, { exact: true })).toBeTruthy();
  }
  await user.selectOptions(screen.getByLabelText("Seleccionar Activo", { exact: true }), "AL30D.BA");
  await user.click(screen.getByRole("button", { name: "Ayuda: Valor nominal (bonos)" }));
  expect(screen.getByRole("tooltip").textContent).toContain("1.000 VN");
});
