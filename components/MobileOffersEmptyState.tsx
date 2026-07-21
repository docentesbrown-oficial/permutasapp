import Link from "next/link";

type MobileOffersEmptyStateProps = {
  type: "no-own-posts" | "no-new-offers";
};

export function MobileOffersEmptyState({
  type,
}: MobileOffersEmptyStateProps) {
  const hasNoOwnPosts =
    type === "no-own-posts";

  return (
    <main className="mobile-empty-page">
      <section className="mobile-empty-card">
        <div className="mobile-empty-icon">
          {hasNoOwnPosts ? "＋" : "✓"}
        </div>

        <span className="mobile-empty-eyebrow">
          {hasNoOwnPosts
            ? "Empezá a buscar"
            : "Ofertas revisadas"}
        </span>

        <h1>
          {hasNoOwnPosts
            ? "Primero publicá un ofrecimiento propio"
            : "No hay nuevos ofrecimientos"}
        </h1>

        <p>
          {hasNoOwnPosts
            ? "Para visualizar posibles permutas, primero tenés que publicar al menos un cargo, curso, módulo u horas cátedra de tu titularidad."
            : "Ya revisaste todas las ofertas disponibles para tus códigos PID. Las nuevas posibilidades aparecerán automáticamente cuando otros docentes publiquen ofrecimientos compatibles."}
        </p>

        {hasNoOwnPosts ? (
          <Link
            href="/panel/movil/nuevo"
            className="primary-empty-button"
          >
            Publicar mi primer ofrecimiento
          </Link>
        ) : (
          <Link
            href="/panel/movil/nuevo"
            className="secondary-empty-button"
          >
            Ofrecer otro curso
          </Link>
        )}

        <Link
          href="/panel?vista=escritorio"
          className="desktop-empty-link"
        >
          Ver versión de escritorio
        </Link>
      </section>

      <style>{`
        .mobile-empty-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100svh - 64px);
          padding: 30px 18px;
          background:
            radial-gradient(
              circle at top right,
              rgba(218, 104, 99, 0.18),
              transparent 32%
            ),
            linear-gradient(
              180deg,
              #f3efdc 0%,
              #ffffff 100%
            );
        }

        .mobile-empty-card {
          width: 100%;
          max-width: 480px;
          border: 1px solid
            rgba(36, 73, 110, 0.13);
          border-radius: 28px;
          padding: 34px 24px;
          background: rgba(
            255,
            255,
            255,
            0.95
          );
          text-align: center;
          box-shadow:
            0 22px 55px
            rgba(36, 73, 110, 0.16);
        }

        .mobile-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: #f3efdc;
          color: #da6863;
          font-size: 38px;
          font-weight: 900;
        }

        .mobile-empty-eyebrow {
          display: block;
          color: #da6863;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .mobile-empty-card h1 {
          margin: 8px auto 13px;
          color: #24496e;
          font-size: 30px;
          line-height: 1.08;
        }

        .mobile-empty-card p {
          margin: 0 auto;
          color: #667784;
          font-size: 14px;
          line-height: 1.6;
        }

        .primary-empty-button,
        .secondary-empty-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 52px;
          margin-top: 24px;
          border-radius: 15px;
          padding: 0 18px;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .primary-empty-button {
          background: #da6863;
          color: #ffffff;
          box-shadow:
            0 11px 24px
            rgba(218, 104, 99, 0.25);
        }

        .secondary-empty-button {
          border: 1px solid
            rgba(36, 73, 110, 0.16);
          background: #f3efdc;
          color: #24496e;
        }

        .desktop-empty-link {
          display: inline-block;
          margin-top: 18px;
          color: #24496e;
          font-size: 12px;
          font-weight: 800;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
    </main>
  );
}
