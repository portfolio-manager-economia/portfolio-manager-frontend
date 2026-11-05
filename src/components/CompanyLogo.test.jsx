import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import CompanyLogo from "./CompanyLogo";

afterEach(cleanup);

it("shows one logo at a time and falls back after each failed source", () => {
  const { container } = render(<CompanyLogo ticker="AAPL" url="https://example.com/apple.png" />);
  expect(container.querySelectorAll("img")).toHaveLength(1);
  expect(container.querySelector("img").getAttribute("src")).toBe("https://example.com/apple.png");
  fireEvent.error(container.querySelector("img"));
  expect(container.querySelectorAll("img")).toHaveLength(1);
  expect(container.querySelector("img").getAttribute("src")).toContain("/apple.svg");
  fireEvent.error(container.querySelector("img"));
  expect(container.querySelector("img")).toBeNull();
  expect(container.querySelector(".company-logo-fallback").textContent).not.toBe("");
});

it("tries the new logo when the selected asset changes after a failure", () => {
  const { container, rerender } = render(<CompanyLogo ticker="UNKNOWN" url="https://example.com/old.png" />);
  fireEvent.error(container.querySelector("img"));
  expect(container.querySelector("img")).toBeNull();
  rerender(<CompanyLogo ticker="MSFT" url="https://example.com/new.png" />);
  expect(container.querySelector("img").getAttribute("src")).toBe("https://example.com/new.png");
});
