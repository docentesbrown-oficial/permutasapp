"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No pudimos iniciar sesión.");

      const requestedRedirect = searchParams.get("redirect");
      const redirect = requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
        ? requestedRedirect
        : "/panel";
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="email">Correo institucional</label>
          <input id="email" name="email" required type="email" autoComplete="email" placeholder="nombre@abc.gob.ar" />
        </div>

        <div className="field full">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" required type="password" autoComplete="current-password" />
        </div>
      </div>

      {error ? <div className="error" role="alert">{error}</div> : null}

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 18 }}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="help" style={{ textAlign: "center", marginTop: 16 }}>
        ¿Todavía no tenés cuenta? <Link href="/registro"><strong>Registrate</strong></Link>
      </p>
    </form>
  );
}
