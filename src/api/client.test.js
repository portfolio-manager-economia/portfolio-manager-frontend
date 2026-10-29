import { afterEach, expect, it, vi } from "vitest";
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("./supabase", () => ({ supabase: { auth: { getSession } } }));
import { fetchPositions, optimizePortfolio } from "./client";

afterEach(() => vi.unstubAllGlobals());

it("does not send portfolio requests without a session", async () => {
  getSession.mockResolvedValue({ data: { session: null } });
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  await expect(fetchPositions()).rejects.toThrow("Iniciá sesión");
  expect(fetch).not.toHaveBeenCalled();
});

it("sends the user token, comparison flag and a zero risk-free rate", async () => {
  getSession.mockResolvedValue({
    data: { session: { access_token: "user-token" } },
  });
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal("fetch", fetch);
  await optimizePortfolio(["AAPL", "MSFT"], 0, "6mo", true);
  const [, options] = fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe("Bearer user-token");
  expect(JSON.parse(options.body)).toMatchObject({
    risk_free_rate: 0,
    compare_current: true,
    period: "6mo",
  });
});
