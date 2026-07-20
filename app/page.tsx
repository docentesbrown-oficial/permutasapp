import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="shell hero">
        <section>
          <span className="eyebrow">Permutas titulares por código PID</span>
          <h1>Tu próximo destino puede estar buscando el tuyo.</h1>
          <p className="lead">
            Publicá tu cargo, módulos u horas cátedra titulares. La plataforma te muestra
            otros ofrecimientos con el mismo PID y prioriza tus distritos preferidos.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-accent" href="/registro">Crear mi cuenta</Link>
            <Link className="btn btn-ghost" href="/login">Ya tengo cuenta</Link>
          </div>
        </section>

        <aside className="demo-card" aria-label="Ejemplo de ofrecimiento">
          <div className="offer-card">
            <div className="offer-head">
              <span className="badge badge-preferred">En un distrito preferido</span>
              <strong>4 módulos titulares de Física</strong>
            </div>
            <div className="offer-body">
              <div className="meta">
                <div className="meta-row"><span>PID</span><strong>123456</strong></div>
                <div className="meta-row"><span>Escuela</span><strong>EES N.º 25</strong></div>
                <div className="meta-row"><span>Distrito</span><strong>Lomas de Zamora</strong></div>
                <div className="meta-row"><span>Días</span><strong>Martes y jueves</strong></div>
                <div className="meta-row"><span>Horario</span><strong>08:00 a 10:00</strong></div>
              </div>
              <div className="hero-actions">
                <button className="btn btn-ghost" type="button">No me sirve</button>
                <button className="btn btn-accent" type="button">Me interesa</button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
