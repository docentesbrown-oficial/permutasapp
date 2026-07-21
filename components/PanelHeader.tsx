import Link from "next/link";
import { Brand } from "./Brand";

export function PanelHeader({
  fullName,
}: {
  fullName: string;
}) {
  return (
    <header className="shell topbar">
      <Brand />

      <div className="nav-actions">
        <span className="help">
          Hola,{" "}
          <strong>
            {fullName}
          </strong>
        </span>

        <Link
          href="/panel/perfil"
          className="btn btn-ghost"
        >
          Mis datos
        </Link>

        <form
          action="/api/auth/logout"
          method="post"
        >
          <button
            className="btn btn-ghost"
            type="submit"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
