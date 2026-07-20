"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          email: form.get("email"),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No pudimos crear la cuenta.");

      setSuccess(data.message);
      formElement.reset();
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
          <label htmlFor="fullName">Nombre y apellido</label>
          <input id="fullName" name="fullName" required autoComplete="name" placeholder="Ej.: Laura Fernández" />
        </div>

        <div className="field full">
          <label htmlFor="phone">Celular</label>
          <input id="phone" name="phone" required autoComplete="tel" inputMode="tel" placeholder="Ej.: 11 4049 2855" />
        </div>

        <div className="field full">
          <label htmlFor="email">Correo institucional</label>
          <input id="email" name="email" required type="email" autoComplete="email" placeholder="nombre@abc.gob.ar" />
          <p className="help">Solo se permiten cuentas terminadas en @abc.gob.ar.</p>
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" required type="password" minLength={8} autoComplete="new-password" />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Repetir contraseña</label>
          <input id="confirmPassword" name="confirmPassword" required type="password" minLength={8} autoComplete="new-password" />
        </div>
      </div>

      {error ? <div className="error" role="alert">{error}</div> : null}
      {success ? <div className="success" role="status">{success}</div> : null}

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 18 }}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="help" style={{ textAlign: "center", marginTop: 16 }}>
        ¿Ya tenés cuenta? <Link href="/login"><strong>Ingresá acá</strong></Link>
      </p>
    </form>
  );
}
