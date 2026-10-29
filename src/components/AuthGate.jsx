import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import { FieldLabel } from "./HelpTooltip";
import { HELP } from "../data/help";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (alive) {
        setSession(nextSession);
        setLoading(false);
      }
    });
    supabase.auth
      .getSession()
      .then(({ data: current, error }) => {
        if (!alive) return;
        if (error) setMessage(error.message);
        setSession(current.session);
        setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setMessage("No se pudo recuperar la sesión.");
          setLoading(false);
        }
      });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (signup && !result.data.session)
        setMessage(
          "Revisá tu correo para confirmar la cuenta y después iniciá sesión.",
        );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!supabase)
    return (
      <div className="min-h-screen bg-slate-950 text-white p-10">
        <h1 className="text-2xl font-bold">Portfolio Manager</h1>
        <p className="mt-4">
          Falta configurar la conexión con Supabase. Seguí la guía de
          instalación del proyecto.
        </p>
      </div>
    );
  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-white p-10">
        Cargando sesión…
      </div>
    );
  if (session)
    return (
      <>
        <div className="bg-slate-900 text-slate-300 flex justify-end items-center gap-4 px-6 py-2 text-xs">
          <span>{session.user.email}</span>
          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) setMessage(error.message);
            }}
          >
            Cerrar sesión
          </button>
          {message && <span role="alert">{message}</span>}
        </div>
        <div key={session.user.id}>{children}</div>
      </>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 space-y-5"
      >
        <h1 className="text-2xl font-bold">Portfolio Manager</h1>
        <p className="text-slate-400">
          {signup
            ? "Creá tu cuenta para guardar tu cartera."
            : "Iniciá sesión para acceder a tu cartera."}
        </p>
        <div>
          <FieldLabel htmlFor="auth-email" help={HELP.email}>Correo</FieldLabel>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full bg-slate-950 rounded-lg p-3 mt-2"
          />
        </div>
        <div>
          <FieldLabel htmlFor="auth-password" help={HELP.password}>Contraseña</FieldLabel>
          <input
            id="auth-password"
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full bg-slate-950 rounded-lg p-3 mt-2"
          />
        </div>
        {message && (
          <p role="status" className="text-amber-300 text-sm">
            {message}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-emerald-600 p-3 font-semibold disabled:opacity-50"
        >
          {busy ? "Procesando…" : signup ? "Crear cuenta" : "Ingresar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSignup(!signup);
            setMessage("");
          }}
          className="text-sm text-emerald-400"
        >
          {signup ? "Ya tengo cuenta" : "Crear una cuenta"}
        </button>
      </form>
    </div>
  );
}
