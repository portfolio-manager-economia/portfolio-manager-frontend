import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
const { auth } = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));
vi.mock("../api/supabase", () => ({ supabase: { auth } }));
import AuthGate from "./AuthGate";

let onChange;
beforeEach(() => {
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.onAuthStateChange.mockImplementation((callback) => {
    onChange = callback;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
});
afterEach(cleanup);

it("keeps the portfolio hidden until sign in and hides it again at sign out", async () => {
  render(
    <AuthGate>
      <p>Mi cartera privada</p>
    </AuthGate>,
  );
  await screen.findByRole("button", { name: "Ingresar" });
  expect(screen.queryByText("Mi cartera privada")).toBeNull();
  act(() =>
    onChange("SIGNED_IN", { user: { id: "one", email: "user@example.com" } }),
  );
  expect(screen.getByText("Mi cartera privada")).toBeTruthy();
  act(() => onChange("SIGNED_OUT", null));
  expect(screen.queryByText("Mi cartera privada")).toBeNull();
});

it("asks to confirm email after registration without opening a private portfolio", async () => {
  const user = userEvent.setup();
  auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
  render(
    <AuthGate>
      <p>Mi cartera privada</p>
    </AuthGate>,
  );
  await user.click(
    await screen.findByRole("button", { name: "Crear una cuenta" }),
  );
  await user.type(screen.getByLabelText("Correo"), "user@example.com");
  await user.type(screen.getByLabelText("Contraseña"), "example-password");
  await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
  expect((await screen.findByRole("status")).textContent).toContain(
    "confirmar la cuenta",
  );
  expect(screen.queryByText("Mi cartera privada")).toBeNull();
});
