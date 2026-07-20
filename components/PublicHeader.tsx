import Link from "next/link";
import { Brand } from "./Brand";

export function PublicHeader() {
  return (
    <header className="shell topbar">
      <Brand />
      <nav className="nav-actions">
        <Link className="btn btn-ghost" href="/login">Ingresar</Link>
        <Link className="btn btn-primary" href="/registro">Registrarme</Link>
      </nav>
    </header>
  );
}
