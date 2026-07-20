import { Suspense } from "react";
import { Brand } from "@/components/Brand";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <header className="shell topbar"><Brand /></header>
      <main className="shell auth-wrap">
        <section className="auth-card">
          <span className="eyebrow">Acceso exclusivo</span>
          <h2>Ingresar</h2>
          <p className="lead" style={{ fontSize: "1rem" }}>
            Accedé a tus puestos y a los ofrecimientos que coinciden con tus códigos PID.
          </p>
          <Suspense fallback={<p>Preparando ingreso...</p>}>
            <LoginForm />
          </Suspense>
        </section>
      </main>
    </>
  );
}
