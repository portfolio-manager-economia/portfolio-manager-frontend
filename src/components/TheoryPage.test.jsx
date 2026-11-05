import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import TheoryPage from "./TheoryPage";

afterEach(cleanup);

it("renders all financial formulas as accessible math without TeX errors", () => {
  const { container } = render(<TheoryPage />);
  expect(screen.getByRole("heading", { name: "Cómo se calcula tu cartera" })).toBeTruthy();
  expect(container.querySelector(".katex-error")).toBeNull();
  expect(screen.getAllByRole("math").length).toBeGreaterThan(7);
  expect(container.querySelector("math mfrac")).toBeTruthy();
  expect(container.querySelector("math msqrt")).toBeTruthy();
  expect(container.querySelector("math msub")).toBeTruthy();
  expect(container.textContent).not.toContain("mu_p =");
  expect(container.textContent).not.toContain("sum(w_i)");
});
