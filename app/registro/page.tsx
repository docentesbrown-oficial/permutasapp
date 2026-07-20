import { Brand } from "@/components/Brand";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegistroPage() {
  return (
    <>
      <header className="shell topbar"><Brand /></header>
      <main className="shell auth-wrap">
        <section className="auth-card">
          <span className="eyebrow">Cuenta docente verificada</span>
          <h2>Crear una cuenta</h2>
          <p className="lead" style={{ fontSize: "1rem" }}>
            Usaremos tu correo institucional para confirmar que pertenecés al sistema educativo provincial.
          </p>
          <RegisterForm />
        </section>
      </main>
    </>
  );
}
